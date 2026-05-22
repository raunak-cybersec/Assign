"""Email service — sends transactional emails via Gmail SMTP.

All emails are dispatched in a background thread so they never block the
HTTP response.  SMTP errors are logged but silently swallowed.
"""

from __future__ import annotations

import logging
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from app.config import Config

logger = logging.getLogger(__name__)

# Jinja2 environment pointed at the templates directory
_TEMPLATES_DIR = Path(__file__).resolve().parent.parent / 'templates'
_jinja_env = Environment(loader=FileSystemLoader(str(_TEMPLATES_DIR)), autoescape=True)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _send_email(to_address: str, subject: str, html_body: str) -> None:
    """Send an HTML email via Gmail SMTP (called in a background thread)."""
    gmail_address = Config.GMAIL_ADDRESS
    gmail_password = Config.GMAIL_APP_PASSWORD

    if not gmail_address or not gmail_password:
        logger.warning('Gmail credentials not configured — skipping email to %s', to_address)
        return

    msg = MIMEMultipart('alternative')
    msg['From'] = f'Assign <{gmail_address}>'
    msg['To'] = to_address
    msg['Subject'] = subject

    # Plain-text fallback
    plain = 'Please view this email in an HTML-capable email client.'
    msg.attach(MIMEText(plain, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(gmail_address, gmail_password)
            server.sendmail(gmail_address, to_address, msg.as_string())
        logger.info('Email sent to %s: %s', to_address, subject)
    except smtplib.SMTPException:
        logger.exception('SMTP error sending email to %s', to_address)
    except Exception:
        logger.exception('Unexpected error sending email to %s', to_address)


def _send_email_async(to_address: str, subject: str, html_body: str) -> None:
    """Fire-and-forget email dispatch in a daemon thread."""
    thread = threading.Thread(
        target=_send_email,
        args=(to_address, subject, html_body),
        daemon=True,
    )
    thread.start()


# ---------------------------------------------------------------------------
# Priority badge colours (mirrors the frontend design tokens)
# ---------------------------------------------------------------------------

_PRIORITY_COLORS: dict[str, dict[str, str]] = {
    'high': {'color': '#dc2626', 'bg': '#fef2f2'},
    'medium': {'color': '#f59e0b', 'bg': '#fffbeb'},
    'low': {'color': '#16a34a', 'bg': '#f0fdf4'},
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def send_task_assigned_email(
    assignee_email: str,
    assignee_name: str,
    task: dict,
    creator_name: str,
) -> None:
    """Send the "you've been assigned a new task" email."""
    priority = task.get('priority', 'medium')
    colors = _PRIORITY_COLORS.get(priority, _PRIORITY_COLORS['medium'])

    task_url = f"{Config.FRONTEND_URL}/tasks/{task['id']}"

    template = _jinja_env.get_template('task_assigned.html')
    html = template.render(
        assignee_name=assignee_name,
        creator_name=creator_name,
        task_title=task.get('title', ''),
        task_priority=priority.capitalize(),
        task_due_date=task.get('due_date') or 'No due date',
        task_description=task.get('description') or '',
        task_url=task_url,
        priority_color=colors['color'],
        priority_bg_color=colors['bg'],
    )

    _send_email_async(
        to_address=assignee_email,
        subject=f'New task assigned: {task.get("title", "Untitled")}',
        html_body=html,
    )


def send_task_completed_email(
    creator_email: str,
    creator_name: str,
    task: dict,
    completer_name: str,
) -> None:
    """Send the "a task you created has been completed" email."""
    task_url = f"{Config.FRONTEND_URL}/tasks/{task['id']}"

    template = _jinja_env.get_template('task_completed.html')
    html = template.render(
        creator_name=creator_name,
        completer_name=completer_name,
        task_title=task.get('title', ''),
        task_url=task_url,
    )

    _send_email_async(
        to_address=creator_email,
        subject=f'Task completed: {task.get("title", "Untitled")}',
        html_body=html,
    )
