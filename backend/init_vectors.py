import json
from backend.services.vector_service import VectorService

# Initialize
service = VectorService()

# Load your funds
with open("data/scheme_metrics_merged.json", encoding="utf-8") as f:
    funds = json.load(f)

# Add to vector DB (this will take a few minutes and use OpenAI API)
result = service.add_funds_from_json(funds)
print(f"Done! Added {result['added']} funds")