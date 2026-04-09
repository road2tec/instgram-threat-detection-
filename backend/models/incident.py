from datetime import datetime
from typing import Optional

class Incident:
    """Incident model representing a cyber security incident"""

    def __init__(
        self,
        id: Optional[int] = None,
        title: str = "",
        description: str = "",
        source: str = "",
        url: str = "",
        published_date: Optional[datetime] = None,
        severity: str = "medium",
        category: str = "unknown",
        threat_actors: Optional[list] = None,
        affected_systems: Optional[list] = None,
        tags: Optional[list] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.title = title
        self.description = description
        self.source = source
        self.url = url
        self.published_date = published_date or datetime.utcnow()
        self.severity = severity
        self.category = category
        self.threat_actors = threat_actors or []
        self.affected_systems = affected_systems or []
        self.tags = tags or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        """Convert incident to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'source': self.source,
            'url': self.url,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'severity': self.severity,
            'category': self.category,
            'threat_actors': self.threat_actors,
            'affected_systems': self.affected_systems,
            'tags': self.tags,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Create incident from dictionary"""
        return cls(
            id=data.get('id'),
            title=data.get('title', ''),
            description=data.get('description', ''),
            source=data.get('source', ''),
            url=data.get('url', ''),
            published_date=data.get('published_date'),
            severity=data.get('severity', 'medium'),
            category=data.get('category', 'unknown'),
            threat_actors=data.get('threat_actors', []),
            affected_systems=data.get('affected_systems', []),
            tags=data.get('tags', []),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
