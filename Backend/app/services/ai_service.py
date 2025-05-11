import os
import requests
from fastapi import HTTPException
from dotenv import load_dotenv
load_dotenv()  # This must come before os.getenv
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import nltk
nltk.data.path.append("C:/Users/Hossam/AppData/Roaming/nltk_data")
nltk.download('punkt')
nltk.download('punkt_tab')



API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise HTTPException(status_code=500, detail="Gemini API key is missing")

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"

def generate_text(prompt: str) -> str:
    try:
        headers = {
            "Content-Type": "application/json"
        }

        body = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }

        response = requests.post(GEMINI_API_URL, headers=headers, json=body)

        if response.status_code == 200:
            result = response.json()
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            raise HTTPException(status_code=response.status_code, detail=f"Error from Gemini API: {response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

# ✅ Function to answer a question based on document context
def answer_question(question: str, context: str) -> dict:
    prompt = f"Context: {context}\nQuestion: {question}\nAnswer:"
    answer = generate_text(prompt)

    return {
        "answer": answer,
        "confidence": None  # Optionally update if your model provides confidence
    
    }

def summarize_text_locally(text: str, sentences_count: int = 5) -> str:
    parser = PlaintextParser.from_string(text, Tokenizer("french"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentences_count)
    return " ".join(str(sentence) for sentence in summary)