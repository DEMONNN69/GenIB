"""
Custom exception handler for DRF
"""

from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, NotAuthenticated
from django.core.exceptions import PermissionDenied
from django.http import Http404


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that returns consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        custom_response = {
            'success': False,
            'message': 'An error occurred',
            'errors': {}
        }
        
        if isinstance(exc, ValidationError):
            custom_response['message'] = 'Validation error'
            custom_response['errors'] = response.data
        elif isinstance(exc, NotAuthenticated):
            custom_response['message'] = 'Authentication required'
        elif isinstance(exc, PermissionDenied):
            custom_response['message'] = 'Permission denied'
        elif isinstance(exc, Http404):
            custom_response['message'] = 'Resource not found'
        else:
            custom_response['message'] = str(exc)
            if hasattr(response, 'data'):
                custom_response['errors'] = response.data
        
        response.data = custom_response
    
    return response
