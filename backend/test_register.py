import requests

url = "http://127.0.0.1:5000/api/register"

data = {
    "full_name": "New Test User",
    "email": "newuser123@finverse.com",
    "phone": "0000000000",
    "password": "Test@12345",
    "date_of_birth": "2000-01-15",
    "address": "Madanapalle"
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:")
print(response.json())
