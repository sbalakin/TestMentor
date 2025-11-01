"""
LDAP Service
Сервис для работы с LDAP аутентификацией
"""

from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from ldap3 import Server, Connection, ALL
from ldap3.core.exceptions import (
    LDAPBindError,
    LDAPException,
    LDAPInvalidCredentialsResult,
)

from core.config import settings


class LdapService:
    """Сервис для работы с LDAP"""

    def __init__(self):
        """Инициализация сервиса"""
        self.host = settings.LDAP_HOST
        self.port = settings.LDAP_PORT
        self.use_ssl = settings.LDAP_USE_SSL
        self.bind_dn = settings.LDAP_BIND_DN
        self.bind_password = settings.LDAP_BIND_PASSWORD
        self.base_dn = settings.LDAP_BASE_DN
        self.timeout = settings.LDAP_CONNECTION_TIMEOUT

    def _create_server(self) -> Server:
        """
        Создание LDAP сервера
        
        Returns:
            Server: LDAP сервер
        """
        return Server(
            self.host,
            port=self.port,
            use_ssl=self.use_ssl,
            get_info=ALL,
        )

    def _get_service_connection(self) -> Connection:
        """
        Получение служебного подключения к LDAP (для поиска пользователей)
        
        Returns:
            Connection: LDAP соединение
            
        Raises:
            HTTPException: При ошибке подключения
        """
        try:
            server = self._create_server()
            conn = Connection(
                server,
                user=self.bind_dn,
                password=self.bind_password,
                auto_bind=True,
            )
            print(f"[LDAP] Успешное подключение к LDAP серверу {self.host}")
            return conn
        except LDAPException as e:
            print(f"[LDAP] Ошибка подключения к LDAP серверу: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="LDAP сервер недоступен",
            ) from e

    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Поиск пользователя в LDAP по email
        
        Args:
            email: Email пользователя
            
        Returns:
            Dict с данными пользователя или None если не найден
            
        Raises:
            HTTPException: При ошибках работы с LDAP
        """
        try:
            conn = self._get_service_connection()

            # Поиск пользователя по email
            search_filter = f"(mail={email})"
            conn.search(
                search_base=self.base_dn,
                search_filter=search_filter,
                attributes=["uid", "cn", "mail", "description", "displayName"],
            )

            if len(conn.entries) == 0:
                print(f"[LDAP] Пользователь с email {email} не найден в LDAP")
                return None

            if len(conn.entries) > 1:
                print(f"[LDAP] Найдено несколько пользователей с email {email}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Найдено несколько пользователей с таким email",
                )

            entry = conn.entries[0]
            user_data = {
                "dn": entry.entry_dn,
                "uid": str(entry.uid) if hasattr(entry, "uid") else None,
                "cn": str(entry.cn) if hasattr(entry, "cn") else None,
                "mail": str(entry.mail) if hasattr(entry, "mail") else None,
                "displayName": str(entry.displayName) if hasattr(entry, "displayName") else str(entry.cn) if hasattr(entry, "cn") else None,
                "description": str(entry.description) if hasattr(entry, "description") else None,
            }

            print(f"[LDAP] Найден пользователь в LDAP: {email}")
            conn.unbind()
            return user_data

        except HTTPException:
            raise
        except LDAPException as e:
            print(f"[LDAP] LDAP ошибка при поиске пользователя {email}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка работы с LDAP: {str(e)}",
            ) from e

    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Аутентификация пользователя в LDAP
        
        Args:
            email: Email пользователя
            password: Пароль пользователя
            
        Returns:
            Dict с данными пользователя если аутентификация успешна, иначе None
            
        Raises:
            HTTPException: При ошибках работы с LDAP
        """
        if not password:
            print(f"[LDAP] Попытка аутентификации с пустым паролем для {email}")
            return None

        # Сначала находим пользователя
        user_data = self.find_user_by_email(email)

        if not user_data or not user_data.get("dn"):
            print(f"[LDAP] Пользователь {email} не найден в LDAP")
            return None

        # Пытаемся аутентифицироваться с найденным DN
        try:
            server = self._create_server()
            conn = Connection(
                server,
                user=user_data["dn"],
                password=password,
                auto_bind=True,
            )

            print(f"[LDAP] Успешная LDAP аутентификация для пользователя: {email}")
            conn.unbind()
            return user_data

        except (LDAPBindError, LDAPInvalidCredentialsResult):
            print(f"[LDAP] Неверный пароль для пользователя {email}")
            return None
        except LDAPException as e:
            print(f"[LDAP] LDAP ошибка при аутентификации пользователя {email}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка работы с LDAP: {str(e)}",
            ) from e


