import requests

url = "http://127.0.0.1:5000/api/account/balance"

# Use the JWT token from your successful login
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NjQ1NzgzNCwianRpIjoiMzZiZmY4NDItNDcyNy00ODI2LWE3MGQtOGIzODM3MTIwOTA5IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3ODY0NTc4MzQsImNzcmYiOiIwMGQyOGZhOC0yYTdjLTQ1MzItODk0NC0wZjBkMGViNzhiNjAiLCJleHAiOjE3ODY0NTg3MzR9.YWRkGew3gCDneJtFmVez7IoHI_eFajQ86otsOj3abQE'

headers = {
    "Authorization": f"Bearer {token}"
}

data = {
    "pin": "1234"
}

response = requests.post(
    url,
    headers=headers,
    json=data
)

print("Status Code:", response.status_code)
print("Response:")
print(response.json())