#!/bin/bash

# توكن الدخول (Access Token)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ4Mzc4MTA2LCJpYXQiOjE3NDgzNzYzMDYsImp0aSI6Ijc4NzllZWY2NmQ5MjQ3ZjhiNzU1NTMxYWM3ZDg5ZWZjIiwidXNlcl9pZCI6MX0.iaioogfsilxwGwMhLbrc2yvAiRay1x2KaRa3VizKfKM"

# Base URL
BASE_URL="http://127.0.0.1:8000"

# Function to test each endpoint
test_api() {
  echo "🔹 Testing $1 ..."
  curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL$1" | jq
  echo -e "\n-------------------------"
}

# Run API tests
test_api "/api/students/"
test_api "/api/staff/"
test_api "/api/classrooms/"
test_api "/api/attendance/"
test_api "/api/medical/"
test_api "/api/invoices/"
test_api "/api/payments/"
test_api "/api/inventory/"
test_api "/api/student-documents/"
test_api "/api/payroll-contracts/"
test_api "/api/salary-records/"
test_api "/api/dashboard/summary/"
