from django.template.loader import render_to_string
from weasyprint import HTML
from django.http import HttpResponse

def render_to_pdf(template_src, context_dict={}, filename="report.pdf"):
    html_string = render_to_string(template_src, context_dict)
    html = HTML(string=html_string)
    pdf = html.write_pdf()
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    return response

