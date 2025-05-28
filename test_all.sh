#!/bin/bash

# STEP 1: تسجيل الدخول
echo "🔐 تسجيل الدخول..."
token=$(curl -s -X POST http://127.0.0.1:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"lumino\", \"password\": \"\$Alwa12334@\"}" | jq -r '.access')

if [[ $token == null || -z $token ]]; then
  echo "❌ فشل تسجيل الدخول. تحقق من اسم المستخدم أو كلمة المرور."
  exit 1
fi

echo "✅ تسجيل الدخول ناجح"
echo "-------------------------------"

# STEP 2: دالة لاستدعاء أي API
call_api () {
  name=$1
  url=$2
  echo "📡 $name:"
  curl -s -X GET "$url" -H "Authorization: Bearer $token" | jq
  echo "-------------------------------"
}

# STEP 3: استدعاء جميع الـ APIs
call_api "Dashboard Summary" "http://127.0.0.1:8000/api/dashboard/summary/"
call_api "Staff List"        "http://127.0.0.1:8000/api/staff/"
call_api "Student List"      "http://127.0.0.1:8000/api/students/"
call_api "Invoices"          "http://127.0.0.1:8000/api/invoices/"
call_api "Payments"          "http://127.0.0.1:8000/api/payments/"
call_api "Medical Records"   "http://127.0.0.1:8000/api/medical/"
call_api "Attendance"        "http://127.0.0.1:8000/api/attendance/"
call_api "Inventory Items"   "http://127.0.0.1:8000/api/inventory/"
call_api "Student Documents" "http://127.0.0.1:8000/api/documents/"
call_api "Contracts"         "http://127.0.0.1:8000/api/contracts/"
call_api "Salary Records"    "http://127.0.0.1:8000/api/salaries/"
