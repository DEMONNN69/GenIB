"""
Management command to populate initial filter types and options
"""

from django.core.management.base import BaseCommand
from apps.filters.models import FilterType, FilterOption


class Command(BaseCommand):
    help = 'Populate initial filter types and options'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating filter types and options...\n')
        
        # 1. Curriculum Filter Type
        curriculum_type, created = FilterType.objects.get_or_create(
            slug='curriculum',
            defaults={
                'name': 'Curriculum',
                'description': 'Educational curriculum or exam board',
                'is_required': True,
                'display_order': 1,
                'show_in_frontend': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created filter type: {curriculum_type.name}'))
            
            curriculums = [
                {'name': 'IB Diploma', 'code': 'IB', 'display_order': 1},
                {'name': 'Cambridge IGCSE', 'code': 'CIE_IGCSE', 'display_order': 2},
                {'name': 'Cambridge AS Level', 'code': 'CIE_AS', 'display_order': 3},
                {'name': 'Cambridge A Level', 'code': 'CIE_A', 'display_order': 4},
                {'name': 'Edexcel IGCSE', 'code': 'EDEXCEL_IGCSE', 'display_order': 5},
                {'name': 'ACT', 'code': 'ACT', 'display_order': 6},
                {'name': 'SAT', 'code': 'SAT', 'display_order': 7},
                {'name': 'AP', 'code': 'AP', 'display_order': 8},
            ]
            for curr in curriculums:
                FilterOption.objects.create(filter_type=curriculum_type, **curr)
            self.stdout.write(f'  → Added {len(curriculums)} curriculum options')
        
        # 2. Subject Filter Type
        subject_type, created = FilterType.objects.get_or_create(
            slug='subject',
            defaults={
                'name': 'Subject',
                'description': 'Academic subject',
                'is_required': True,
                'display_order': 2,
                'show_in_frontend': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created filter type: {subject_type.name}'))
            
            subjects = [
                {'name': 'Mathematics', 'code': 'MATH', 'display_order': 1},
                {'name': 'Physics', 'code': 'PHY', 'display_order': 2},
                {'name': 'Chemistry', 'code': 'CHEM', 'display_order': 3},
                {'name': 'Biology', 'code': 'BIO', 'display_order': 4},
                {'name': 'English', 'code': 'ENG', 'display_order': 5},
                {'name': 'History', 'code': 'HIST', 'display_order': 6},
                {'name': 'Geography', 'code': 'GEO', 'display_order': 7},
                {'name': 'Economics', 'code': 'ECON', 'display_order': 8},
                {'name': 'Business Studies', 'code': 'BUS', 'display_order': 9},
                {'name': 'Computer Science', 'code': 'CS', 'display_order': 10},
            ]
            for subj in subjects:
                FilterOption.objects.create(filter_type=subject_type, **subj)
            self.stdout.write(f'  → Added {len(subjects)} subject options')
        
        # 3. Year Filter Type
        year_type, created = FilterType.objects.get_or_create(
            slug='year',
            defaults={
                'name': 'Year',
                'description': 'Examination year',
                'is_required': True,
                'display_order': 3,
                'show_in_frontend': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created filter type: {year_type.name}'))
            
            # Add last 10 years
            import datetime
            current_year = datetime.datetime.now().year
            for i, year in enumerate(range(current_year, current_year - 10, -1)):
                FilterOption.objects.create(
                    filter_type=year_type,
                    name=str(year),
                    code=str(year),
                    display_order=i + 1
                )
            self.stdout.write(f'  → Added 10 year options')
        
        # 4. Season Filter Type
        season_type, created = FilterType.objects.get_or_create(
            slug='season',
            defaults={
                'name': 'Season',
                'description': 'Examination season/session',
                'is_required': True,
                'display_order': 4,
                'show_in_frontend': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created filter type: {season_type.name}'))
            
            seasons = [
                {'name': 'May/June', 'code': 'MAY_JUNE', 'display_order': 1},
                {'name': 'October/November', 'code': 'OCT_NOV', 'display_order': 2},
                {'name': 'February/March', 'code': 'FEB_MARCH', 'display_order': 3},
                {'name': 'Winter', 'code': 'WINTER', 'display_order': 4},
                {'name': 'Summer', 'code': 'SUMMER', 'display_order': 5},
            ]
            for season in seasons:
                FilterOption.objects.create(filter_type=season_type, **season)
            self.stdout.write(f'  → Added {len(seasons)} season options')
        
        # 5. Zone Filter Type
        zone_type, created = FilterType.objects.get_or_create(
            slug='zone',
            defaults={
                'name': 'Zone',
                'description': 'Timezone zone',
                'is_required': False,
                'display_order': 5,
                'show_in_frontend': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created filter type: {zone_type.name}'))
            
            zones = [
                {'name': 'Zone 1', 'code': '1', 'display_order': 1},
                {'name': 'Zone 2', 'code': '2', 'display_order': 2},
                {'name': 'Zone 3', 'code': '3', 'display_order': 3},
                {'name': 'Zone 4', 'code': '4', 'display_order': 4},
            ]
            for zone in zones:
                FilterOption.objects.create(filter_type=zone_type, **zone)
            self.stdout.write(f'  → Added {len(zones)} zone options')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Filter system populated successfully!'))
        self.stdout.write('\nNow you can:')
        self.stdout.write('1. Go to Django admin → Filter Types/Options to manage filters')
        self.stdout.write('2. Add papers and select filter options')
        self.stdout.write('3. Create new filter types (e.g., Difficulty, Topic) dynamically!')
