from sentence_transformers import SentenceTransformer, util
import torch

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.corpus = []
        self.embeddings = None

    def add_to_index(self, texts):
        """
        Add texts to the in-memory corpus and compute their embeddings.
        """
        if not texts:
            raise ValueError("Cannot add an empty list of texts.")
        
        self.corpus = texts
        self.embeddings = self.model.encode(texts, convert_to_tensor=True)

    def search(self, query, top_k=3):
        """
        Search for the top_k most relevant texts based on cosine similarity.
        """
        if not query:
            raise ValueError("Query text cannot be empty.")
        
        if self.embeddings is None or not self.corpus:
            return []

        # Encode the query
        query_embedding = self.model.encode(query, convert_to_tensor=True)

        # Compute cosine similarity
        cos_scores = util.cos_sim(query_embedding, self.embeddings)[0]

        # Get top-k highest scores
        top_results = torch.topk(cos_scores, k=min(top_k, len(self.corpus)))

        # Build result list with scores and matching text
        hits = [
            {
                "corpus_id": int(idx),
                "score": float(score),
                "text": self.corpus[int(idx)]
            }
            for idx, score in zip(top_results.indices, top_results.values)
        ]

        return hits
