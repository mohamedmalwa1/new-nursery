<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
    h2 { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h2>Student Report</h2>
  <table>
    <thead>
      <tr><th>Name</th><th>Class</th><th>Teacher</th><th>Enrollment</th></tr>
    </thead>
    <tbody>
      {% for s in students %}
      <tr>
        <td>{{ s.first_name }} {{ s.last_name }}</td>
        <td>{{ s.classroom.name }}</td>
        <td>{{ s.teacher.name }}</td>
        <td>{{ s.enrollment_date }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</body>
</html>

