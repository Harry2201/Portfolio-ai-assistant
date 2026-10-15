/* Talk to Me Widget: AI-powered, session-aware, UI-safe */

const aiChatState = {
  sessionId: localStorage.getItem("aiSessionId") || null,
};

(() => {
  const WIDGET_ID = "talk-to-me-widget";
  const BACKEND_URL = "http://localhost:5000/chat";
  const TTS_URL = "http://localhost:5000/tts";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function nl2br(str) {
    return escapeHtml(str).replace(/\n/g, "<br>");
  }

  function buildWidget() {
    const wrapper = document.createElement("div");
    wrapper.id = WIDGET_ID;
    wrapper.className = "talk-widget talk-widget--closed";

    wrapper.innerHTML = `
      <div class="talk-widget__panel" role="dialog">
        <div class="talk-widget__header">
          <div class="talk-widget__title">
            Talk to Hariom
            <span class="talk-widget__listening">
              Listening...
            </span>
          </div>

          <div class="talk-widget__headerControls">
            <button
              class="talk-widget__micBtn"
              aria-label="Start voice input"
              type="button"
            >🎤</button>

            <button
              class="talk-widget__close"
              aria-label="Close chat"
              type="button"
            >✕</button>
          </div>
        </div>

        <div class="talk-widget__body"></div>
        <div class="talk-widget__followups"></div>
      </div>

      <div class="talk-widget__backdrop"></div>
    `;

    const body = wrapper.querySelector(".talk-widget__body");
    const followups = wrapper.querySelector(".talk-widget__followups");
    const micBtn = wrapper.querySelector(".talk-widget__micBtn");
    const listeningEl = wrapper.querySelector(".talk-widget__listening");

    wrapper.querySelector(".talk-widget__close").onclick = () =>
      window.TalkToMeWidget.close();

    wrapper.querySelector(".talk-widget__backdrop").onclick = () =>
      window.TalkToMeWidget.close();

    // Voice recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition;
    let isListening = false;
    let transcript = "";

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        transcript = event.results[0][0].transcript.trim();
      };

      recognition.onend = async () => {
        isListening = false;
        micBtn.classList.remove("active");
        listeningEl.classList.remove("talk-widget__listening--active");

        if (!transcript) return;

        const userText = transcript;
        transcript = "";

        addUserMessage(body, userText);
        await sendToBackend(userText, body, followups);
      };

      recognition.onerror = (event) => {
        isListening = false;
        micBtn.classList.remove("active");
        listeningEl.classList.remove("talk-widget__listening--active");

        console.error("[Voice] Recognition error:", event.error);

        if (event.error !== "no-speech" && event.error !== "aborted") {
          addBotMessage(
            body,
            "I couldn't hear that clearly. Please try again.",
          );
        }
      };
    }

    micBtn.onclick = () => {
      if (!recognition) {
        addBotMessage(body, "Voice input is not supported in this browser.");
        return;
      }

      if (isListening) {
        recognition.stop();
        return;
      }

      transcript = "";

      try {
        recognition.start();
        isListening = true;

        micBtn.classList.add("active");
        listeningEl.classList.add("talk-widget__listening--active");
      } catch (error) {
        console.error("[Voice] Could not start recognition:", error);
      }
    };

    addBotMessage(
      body,
      "Hi! You can ask me about Hariom's background, projects, skills, or internships.",
    );

    document.body.appendChild(wrapper);
    return wrapper;
  }

  // Send a message to the Node.js chat backend.
  async function sendToBackend(text, body, followups) {
    followups.innerHTML = "";

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId: aiChatState.sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat request failed: ${res.status}`);
      }

      const data = await res.json();

      // Save the conversation session.
      if (data.sessionId) {
        aiChatState.sessionId = data.sessionId;
        localStorage.setItem("aiSessionId", data.sessionId);
      }

      if (!data.reply) {
        addBotMessage(
          body,
          "I couldn't generate a response. Please try again.",
        );
        return;
      }

      addBotMessage(body, data.reply);

      // Speak the assistant's response.
      if (data.reply && data.reply.trim()) {
        ttsSpeak(data.reply.trim());
      }

      // Render the optional follow-up button.
      if (typeof data.followUp === "string" && data.followUp.trim()) {
        renderFollowUp(data.followUp, body, followups);
      }
    } catch (error) {
      console.error("[Chat] Request failed:", error);

      addBotMessage(
        body,
        "Sorry, I couldn't reach the assistant. Please try again.",
      );
    }
  }

  // Generate and play the assistant's response sentence by sentence.

  // Generate and play the assistant's response sentence by sentence.
  async function ttsSpeak(text) {
    if (!text || !text.trim()) return;

    // Split the response into sentences.
    const sentences =
      text.match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) || [text];

    const chunks = sentences.map((sentence) => sentence.trim()).filter(Boolean);

    if (!chunks.length) return;

    // Stop any previous speech.
    if (window.__talkToMeAudio) {
      window.__talkToMeAudio.pause();
      window.__talkToMeAudio.currentTime = 0;
      window.__talkToMeAudio = null;
    }

    // Identify this playback session.
    const playbackId = (window.__talkToMePlaybackId || 0) + 1;
    window.__talkToMePlaybackId = playbackId;

    // Generate audio for one sentence.
    async function generateAudio(sentence) {
      const startedAt = performance.now();

      console.log("[TTS] Sending sentence:", sentence);

      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: sentence }),
      });

      console.log(
        "[TTS] Response received after",
        ((performance.now() - startedAt) / 1000).toFixed(2),
        "seconds"
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`TTS request failed (${res.status}): ${errorText}`);
      }

      const data = await res.json();

      if (!data.audio_url) {
        throw new Error("TTS response did not contain an audio URL");
      }

      console.log("[TTS] Audio URL:", data.audio_url);
      return data.audio_url;
    }

    // Play an audio URL and wait until playback finishes.
    function playAudio(audioUrl) {
      return new Promise((resolve, reject) => {
        if (playbackId !== window.__talkToMePlaybackId) {
          resolve();
          return;
        }

        const audio = new Audio(audioUrl);
        window.__talkToMeAudio = audio;

        let finished = false;

        function cleanup() {
          audio.removeEventListener("ended", onEnded);
          audio.removeEventListener("error", onError);
          audio.removeEventListener("playing", onPlaying);
        }

        function onEnded() {
          if (finished) return;
          finished = true;
          cleanup();

          if (window.__talkToMeAudio === audio) {
            window.__talkToMeAudio = null;
          }

          console.log("[TTS] Audio playback finished");
          resolve();
        }

        function onError() {
          if (finished) return;
          finished = true;
          cleanup();

          console.error("[TTS] Audio element error:", audio.error);

          if (window.__talkToMeAudio === audio) {
            window.__talkToMeAudio = null;
          }

          reject(new Error("Audio playback failed"));
        }

        function onPlaying() {
          console.log("[TTS] Playback started");
        }

        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);
        audio.addEventListener("playing", onPlaying);

        audio.play()
          .then(() => {
            console.log("[TTS] audio.play() succeeded");
          })
          .catch((error) => {
            if (finished) return;
            finished = true;
            cleanup();

            console.error(
              "[TTS] audio.play() failed:",
              error.name,
              error.message
            );

            if (window.__talkToMeAudio === audio) {
              window.__talkToMeAudio = null;
            }

            reject(error);
          });
      });
    }

    try {
      // Start generating the first sentence.
      let nextAudioPromise = generateAudio(chunks[0]);

      for (let i = 0; i < chunks.length; i++) {
        const audioUrl = await nextAudioPromise;

        // Stop if a newer response has replaced this one.
        if (playbackId !== window.__talkToMePlaybackId) {
          return;
        }

        console.log("[TTS] Audio generated:", audioUrl);

        // Generate the next sentence while this one plays.
        if (i + 1 < chunks.length) {
          nextAudioPromise = generateAudio(chunks[i + 1]);
        }

        // Play the current sentence.
        await playAudio(audioUrl);

        if (playbackId !== window.__talkToMePlaybackId) {
          return;
        }
      }
    } catch (error) {
      console.error("[TTS] Playback failed:", error);
    }
  }


  // Render a follow-up question as a button.
  function renderFollowUp(text, body, followups) {
    const btn = document.createElement("button");

    btn.className = "talk-widget__quickBtn";
    btn.type = "button";
    btn.textContent = text;

    btn.onclick = () => {
      followups.innerHTML = "";
      addUserMessage(body, text);
      sendToBackend(text, body, followups);
    };

    followups.appendChild(btn);
  }

  // Add a user message safely.
  function addUserMessage(container, text) {
    container.innerHTML += `
      <div class="talk-widget__msg talk-widget__msg--user">
        <div class="talk-widget__bubble">${nl2br(text)}</div>
      </div>
    `;

    scroll(container);
  }

  // Add an assistant message safely.
  function addBotMessage(container, text) {
    container.innerHTML += `
      <div class="talk-widget__msg talk-widget__msg--bot">
        <div class="talk-widget__bubble">${nl2br(text)}</div>
      </div>
    `;

    scroll(container);
  }

  function scroll(element) {
    element.scrollTop = element.scrollHeight;
  }

  function getWidget() {
    return document.getElementById(WIDGET_ID) || buildWidget();
  }

  function setOpen(open) {
    const widget = getWidget();

    widget.classList.toggle("talk-widget--open", open);
    widget.classList.toggle("talk-widget--closed", !open);
  }

  window.TalkToMeWidget = {
    toggle() {
      const widget = getWidget();

      setOpen(!widget.classList.contains("talk-widget--open"));
    },

    close() {
      setOpen(false);
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".talk-to-me-btn").forEach((btn) => {
      btn.onclick = (event) => {
        event.preventDefault();
        window.TalkToMeWidget.toggle();
      };
    });
  });
})();
