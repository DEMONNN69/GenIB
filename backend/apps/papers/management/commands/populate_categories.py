"""
Management command to populate initial categories
"""

from django.core.management.base import BaseCommand
from apps.papers.models import Category


class Command(BaseCommand):
    help = 'Populate initial paper categories from frontend data'

    def handle(self, *args, **options):
        self.stdout.write('Creating paper categories...')
        
        categories_data = [
            {
                'name': 'Past Year Papers',
                'description': 'Free, PDF, downloadable',
                'icon': 'DocumentText',
                'is_main': True,
                'is_free': True,
                'is_downloadable': True,
                'is_online': False,
                'display_order': 1
            },
            {
                'name': 'Topical Past Papers',
                'description': 'Not free, online, not downloadable',
                'icon': 'Book',
                'is_main': False,
                'is_free': False,
                'is_downloadable': False,
                'is_online': True,
                'display_order': 2
            },
            {
                'name': 'MCQ Past Papers',
                'description': 'Not free, online practice',
                'icon': 'MessageQuestion',
                'is_main': False,
                'is_free': False,
                'is_downloadable': False,
                'is_online': True,
                'display_order': 3
            },
            {
                'name': 'Non-Topical Past Papers',
                'description': 'Free, online, not downloadable',
                'icon': 'ClipboardText',
                'is_main': False,
                'is_free': True,
                'is_downloadable': False,
                'is_online': True,
                'display_order': 4
            },
            {
                'name': 'Solved Past Papers',
                'description': 'Not free, PDF, downloadable',
                'icon': 'Teacher',
                'is_main': False,
                'is_free': False,
                'is_downloadable': True,
                'is_online': False,
                'display_order': 5
            },
            {
                'name': 'GenIB Question Bank',
                'description': 'Free, online, not downloadable',
                'icon': 'Building4',
                'is_main': False,
                'is_free': True,
                'is_downloadable': False,
                'is_online': True,
                'display_order': 6
            },
            {
                'name': 'ACT, SAT, AP',
                'description': 'Free, online, not downloadable',
                'icon': 'Star',
                'is_main': False,
                'is_free': True,
                'is_downloadable': False,
                'is_online': True,
                'display_order': 7
            },
            {
                'name': 'Build Exam or Worksheet',
                'description': 'Not free, convert to PDF, printable',
                'icon': 'DocumentCode2',
                'is_main': False,
                'is_free': False,
                'is_downloadable': True,
                'is_online': False,
                'is_printable': True,
                'display_order': 8
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for cat_data in categories_data:
            category, created = Category.objects.update_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {category.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated: {category.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Finished! Created: {created_count}, Updated: {updated_count}'
            )
        )
