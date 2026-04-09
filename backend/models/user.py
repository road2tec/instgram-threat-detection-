from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId
import bcrypt
from email_validator import validate_email, EmailNotValidError


class User:
    """User model for authentication and user management"""

    def __init__(
        self,
        _id: Optional[ObjectId] = None,
        email: str = "",
        password_hash: str = "",
        first_name: str = "",
        last_name: str = "",
        role: str = "user",
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        last_login: Optional[datetime] = None
    ):
        self._id = _id or ObjectId()
        self.email = email.lower().strip()
        self.password_hash = password_hash
        self.first_name = first_name.strip()
        self.last_name = last_name.strip()
        self.role = role
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.last_login = last_login

    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary format for MongoDB storage"""
        return {
            "_id": self._id,
            "email": self.email,
            "password_hash": self.password_hash,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "last_login": self.last_login
        }

    def to_json(self) -> Dict[str, Any]:
        """Convert user to JSON format (without sensitive data)"""
        return {
            "id": str(self._id),
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": f"{self.first_name} {self.last_name}".strip(),
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """Create User instance from MongoDB document"""
        return cls(
            _id=data.get("_id"),
            email=data.get("email", ""),
            password_hash=data.get("password_hash", ""),
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role=data.get("role", "user"),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            last_login=data.get("last_login")
        )

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def check_password(self, password: str) -> bool:
        """Check if provided password matches the stored hash"""
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)

    def set_password(self, password: str) -> None:
        """Set a new password (hashes it automatically)"""
        self.password_hash = self.hash_password(password)
        self.updated_at = datetime.utcnow()

    def update_last_login(self) -> None:
        """Update the last login timestamp"""
        self.last_login = datetime.utcnow()

    def update_timestamp(self) -> None:
        """Update the updated_at timestamp"""
        self.updated_at = datetime.utcnow()

    @staticmethod
    def validate_email(email: str) -> tuple[bool, str]:
        """Validate email format (skipping deliverability check for development)"""
        try:
            # Normalize email without DNS check to allow local testing domains
            validated_email = validate_email(email, check_deliverability=False)
            return True, validated_email.email
        except EmailNotValidError as e:
            return False, str(e)

    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        """Validate password length"""
        if len(password) < 6:
            return False, "Password must be at least 6 characters long"

        return True, "Password is valid"

    def validate_user_data(self) -> tuple[bool, list]:
        """Validate all user data"""
        errors = []

        # Validate email
        email_valid, email_msg = self.validate_email(self.email)
        if not email_valid:
            errors.append(f"Email: {email_msg}")

        # Validate names
        if not self.first_name.strip():
            errors.append("First name is required")

        if not self.last_name.strip():
            errors.append("Last name is required")

        # Validate role
        valid_roles = ["user", "admin", "analyst"]
        if self.role not in valid_roles:
            errors.append(f"Role must be one of: {', '.join(valid_roles)}")

        return len(errors) == 0, errors

    def __str__(self) -> str:
        return f"<User {self.email}>"

    def __repr__(self) -> str:
        return f"User(_id={self._id}, email='{self.email}', role='{self.role}')"