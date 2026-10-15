\# Portfolio | Hariom Pandey



A personal portfolio website showcasing my background, technical skills, projects, and interests in software development and applied Artificial Intelligence.



The project includes an AI-powered chat assistant and a separate text-to-speech (TTS) service.



\## Features



\- \*\*Personal Portfolio:\*\* Introduction, skills, projects, and contact information.

\- \*\*AI Chat Assistant:\*\* Answers questions about my profile, skills, education, and projects using an LLM API.

\- \*\*Text-to-Speech:\*\* Converts text responses into spoken audio using the Kokoro TTS model.

\- \*\*Frontend Interface:\*\* Browser-based portfolio and interactive assistant.

\- \*\*Separate Backend Services:\*\* Node.js API and Python-based TTS API.



\## Technology Stack



| Component | Technologies |

|---|---|

| Frontend | HTML, CSS, JavaScript |

| Chat Backend | Node.js, Express.js |

| AI Integration | OpenAI-compatible API through Groq |

| TTS Backend | Python, FastAPI, Kokoro TTS, PyTorch |

| Development | Git, GitHub, Visual Studio Code |



\## Project Structure



```text

Portfolio/

├── Frontend/

│   ├── index.html

│   ├── favicon.svg

│   └── ...

├── Backend/

│   ├── index.js

│   └── ...

├── TTS-Backend/

│   └── ...

├── .gitignore

└── README.md

```



\*The exact files inside each directory may differ from this example.\*



\## Getting Started



\### Prerequisites



Install the following before running the project:



\- Node.js and npm

\- Python

\- Git



Additional Python and Node.js dependencies may be required by the respective services.



\### 1. Clone the repository



```bash

git clone https://github.com/YOUR\_USERNAME/YOUR\_REPOSITORY.git

cd YOUR\_REPOSITORY

```



Replace the repository URL with the actual GitHub repository URL.



\### 2. Run the frontend



Open a terminal in the project root and run:



```bash

python -m http.server 8080 --directory Frontend

```



Open \[http://127.0.0.1:8080/](http://127.0.0.1:8080/).



\### 3. Run the Node.js backend



Open another terminal:



```bash

cd Backend

npm install

```



Configure the required environment variables using the backend's configuration and then start the server using the appropriate script defined in `package.json`.



The chat backend currently uses port `5000`.



\### 4. Run the TTS backend



Open a separate terminal:



```bash

cd TTS-Backend

```



Create and activate a Python virtual environment, install the project's required dependencies, and configure the environment according to the TTS backend's instructions.



Start the FastAPI service using the command appropriate to the actual application entry point. The local TTS service currently uses port `8001`.



\*\*Note:\*\* GPU acceleration requires compatible hardware, NVIDIA drivers, and CUDA-enabled PyTorch. CPU execution may require different configuration and can be slower.



\## Environment Variables and Security



\- Store API keys in environment variables, never in frontend JavaScript or committed source files.

\- Keep `.env` files out of Git.

\- Configure the required secrets separately in your deployment provider.

\- Never expose private credentials in screenshots, logs, or public repositories.



\## Deployment



The frontend can be deployed separately on a static hosting platform such as Vercel or Netlify.



The Node.js chat API and Python TTS service require compatible hosting and publicly accessible endpoints for production use. A locally running service on `localhost` is not accessible to external visitors.



GPU-based TTS may require a separate GPU-capable hosting provider.



\## Current Development Status



This project is under active development. Features, configuration, and deployment arrangements may change as improvements are made.



\## Author



\*\*Hariom Pandey\*\*



\- GitHub: \[Harry2201](https://github.com/Harry2201)

\- Portfolio: \[Add your deployed portfolio URL here]

\- Email: \[Add your preferred public contact email here]



\## License



No license has been specified yet. Unless a license is added, the repository's contents remain subject to applicable copyright law.
