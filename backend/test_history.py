import requests

url = "http://127.0.0.1:5000/api/history"

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NjQ2MTEwNiwianRpIjoiOWQ1ZDIzMGQtM2RiNy00NTU3LWJiYTgtZmM2MjY5ZWFiZjIzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3ODY0NjExMDYsImNzcmYiOiIwNGUzYzhhZi00MTA1LTQ1MmUtYTcyYS0wMGFjMGYzNDZiMmIiLCJleHAiOjE3ODY0NjIwMDZ9.JJD4C1wjCYDJxwJvyVspwzYRRoCEcUDGfjBHj-aIi9s'

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