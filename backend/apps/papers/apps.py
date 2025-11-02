from django.apps import AppConfig


class PapersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.papers'
    verbose_name = 'Papers & Categories'
    
    def ready(self):
        """Import signals when app is ready"""
        pass
