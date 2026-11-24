import requests

url = "http://127.0.0.1:5000/api/profile"

token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NjQ2MTMwNiwianRpIjoiMGNiYjI4YjItMTBkMy00OWY3LTg2ZWEtZWFjODg4YmFmMDZlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3ODY0NjEzMDYsImNzcmYiOiIzMWVmMTFiZS0zMTEwLTQ0MWQtOTM4OC05NjU4YWIwZDcyYjkiLCJleHAiOjE3ODY0NjIyMDZ9.8KlB30nQ0Fs-yaU441JN6kRbs1dVXxAOCn7tdmvhi0A'

headers = {
    "Authorization": f"Bearer {token}"
}

response = requests.get(
    url,
    headers=headers
)

print("Status Code:", response.status_code)
print("Response:")
print(response.json())