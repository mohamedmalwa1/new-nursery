# nursery/utils/pdf.py
from django.template.loader import render_to_string
from weasyprint import HTML
from django.http import HttpResponse
import tempfile

def render_to_pdf(template_src, context_dict={}):
    html_string = render_to_string(template_src, context_dict)
    html = HTML(string=html_string)

    result = tempfile.NamedTemporaryFile(delete=True)
    html.write_pdf(target=result.name)

    result.seek(0)
    return HttpResponse(result.read(), content_type='application/pdf')

