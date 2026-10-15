
import logging
import os
import time
import uuid
from pathlib import Path

import numpy as np
import soundfile as sf
from fastapi import FastAPI, Header, HTTPException
from fastapi.staticfiles import StaticFiles
from kokoro import KPipeline
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

logger = logging.getLogger("tts")

app = FastAPI()

logger.info("Loading Kokoro pipeline")
model_started = time.perf_counter()
pipeline = KPipeline(lang_code="a", device="cuda")
logger.info(
    "KOKORO_MODEL_READY load_seconds=%.2f",
    time.perf_counter() - model_started,
)

BASE_DIR = Path(__file__).resolve().parent
AUDIO_DIR = BASE_DIR / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/audio",
    StaticFiles(directory=str(AUDIO_DIR)),
    name="audio",
)


class TTSRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True}


@app.post("/tts")
def generate_tts(
    req: TTSRequest,
    x_request_id: str | None = Header(default=None),
):
    request_id = x_request_id or str(uuid.uuid4())
    started = time.perf_counter()

    def log(stage, **fields):
        logger.info(
            "request_id=%s stage=%s elapsed_ms=%.1f details=%s",
            request_id,
            stage,
            (time.perf_counter() - started) * 1000,
            fields,
        )

    text = req.text.strip()

    log("REQUEST_RECEIVED", text_length=len(text))

    if not text:
        log("VALIDATION_FAILED")
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty",
        )

    filename = f"{uuid.uuid4()}.wav"
    filepath = AUDIO_DIR / filename

    try:
        # Includes time waiting for the first generated chunk.
        generation_started = time.perf_counter()
        log("KOKORO_GENERATION_START", voice="am_adam")

        audio_chunks = []

        for _, _, audio in pipeline(text, voice="am_adam"):
            audio_chunks.append(np.asarray(audio))

        generation_seconds = (
            time.perf_counter() - generation_started
        )

        log(
            "KOKORO_GENERATION_COMPLETE",
            generation_seconds=round(generation_seconds, 3),
            chunks=len(audio_chunks),
        )

        if not audio_chunks:
            raise RuntimeError("Kokoro generated no audio chunks")

        write_started = time.perf_counter()

        combined_audio = np.concatenate(audio_chunks)
        sf.write(str(filepath), combined_audio, 24000)

        log(
            "WAV_WRITE_COMPLETE",
            write_seconds=round(
                time.perf_counter() - write_started, 3
            ),
            audio_samples=len(combined_audio),
            audio_duration_seconds=round(
                len(combined_audio) / 24000, 2
            ),
            file_bytes=filepath.stat().st_size,
        )

        log(
            "REQUEST_COMPLETED",
            total_seconds=round(time.perf_counter() - started, 3),
        )

        return {
            "audio_url": f"http://localhost:8001/audio/{filename}",
            "generation_seconds": round(generation_seconds, 3),
            "requestId": request_id,
        }

    except Exception as exc:
        if filepath.exists():
            filepath.unlink()

        logger.exception(
            "request_id=%s stage=GENERATION_FAILED",
            request_id,
        )

        raise HTTPException(
            status_code=500,
            detail=f"Speech generation failed: {exc}",
        ) from exc
