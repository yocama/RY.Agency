#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import html
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

INDEX_PATH = Path("index.html")
PLACE_ID = "ChIJI4Sn_M2TtocR2qf9mXXWuaY"
START_MARKER = "<!-- AUTO-REVIEWS:START -->"
END_MARKER = "<!-- AUTO-REVIEWS:END -->"
TARGET_REVIEW_COUNT = 10
MAPS_KEY_PATTERN = re.compile(r"maps.googleapis.com/maps/api/js\?key=([^&\"']+)")


def load_api_key(index_html: str) -> str:
    env_key = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
    if env_key:
        return env_key

    match = MAPS_KEY_PATTERN.search(index_html)
    if not match:
        raise RuntimeError("Could not locate the Google Maps API key in index.html.")

    return html.unescape(match.group(1))


def fetch_place_details(api_key: str, reviews_sort: str) -> dict[str, Any]:
    params = urllib.parse.urlencode(
        {
            "place_id": PLACE_ID,
            "fields": "name,rating,user_ratings_total,reviews,url,formatted_address",
            "reviews_sort": reviews_sort,
            "key": api_key,
        }
    )
    url = f"https://maps.googleapis.com/maps/api/place/details/json?{params}"

    with urllib.request.urlopen(url) as response:
        payload = json.loads(response.read().decode("utf-8"))

    status = payload.get("status")
    if status != "OK":
        raise RuntimeError(f"Google Places API returned status {status!r} for sort={reviews_sort!r}.")

    return payload["result"]


def normalize_whitespace(value: str) -> str:
    return " ".join(value.split())


def normalize_review_text(value: str) -> str:
    text = normalize_whitespace(value)
    text = re.sub(r"^Title:\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+([.,!?;:])", r"\1", text)
    text = re.sub(r"([.,!?;:])(?=[A-Za-z])", r"\1 ", text)
    return text.strip()


def trim_review_text(value: str, limit: int = 210) -> str:
    text = normalize_review_text(value)
    if not text:
        return "Left a 5-star Google review for the agency."

    if len(text) <= limit:
        return text

    sentences = re.split(r"(?<=[.!?])\s+", text)
    selected: list[str] = []

    for sentence in sentences:
        candidate = " ".join(selected + [sentence]).strip()
        if len(candidate) <= limit:
            selected.append(sentence)
        else:
            break

    if selected:
        return " ".join(selected).strip()

    clipped = text[: limit - 1].rsplit(" ", 1)[0].strip()
    if not clipped:
        clipped = text[: limit - 1].strip()
    return clipped + "..."


def format_review_date(unix_seconds: int | None) -> str:
    if not unix_seconds:
        return "Google review"

    timestamp = dt.datetime.fromtimestamp(unix_seconds, tz=dt.timezone.utc)
    return f"Google review - {timestamp.strftime('%B')} {timestamp.day}, {timestamp.year}"


def review_identity(review: dict[str, Any]) -> tuple[Any, ...]:
    return (
        review.get("author_url") or review.get("author_name") or "",
        review.get("time") or 0,
        normalize_whitespace(review.get("text", "")),
    )


def collect_reviews(api_key: str) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    newest_result = fetch_place_details(api_key, "newest")
    relevant_result = fetch_place_details(api_key, "most_relevant")

    merged: list[dict[str, Any]] = []
    seen: set[tuple[Any, ...]] = set()

    for source_reviews in (newest_result.get("reviews", []), relevant_result.get("reviews", [])):
        for review in source_reviews:
            if review.get("rating") != 5:
                continue

            identity = review_identity(review)
            if identity in seen:
                continue

            seen.add(identity)
            merged.append(review)

    if not merged:
        raise RuntimeError("No 5-star Google reviews were returned.")

    selected = merged[:TARGET_REVIEW_COUNT]
    return newest_result, selected


def build_review_card(review: dict[str, Any]) -> str:
    author_name = html.escape(review.get("author_name") or "Google Reviewer")
    review_text = html.escape(trim_review_text(review.get("text", "")))
    review_date = html.escape(format_review_date(review.get("time")))

    return "\n".join(
        [
            '                    <div class="testimonial-card">',
            '                        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>',
            f'                        <p>"{review_text}"</p>',
            f'                        <p class="testimonial-author">- {author_name}</p>',
            f'                        <p class="testimonial-meta">{review_date}</p>',
            '                    </div>',
        ]
    )


def render_cards(reviews: list[dict[str, Any]]) -> str:
    cards = [build_review_card(review) for review in reviews]
    return "\n".join(cards)


def update_index_html(index_html: str, reviews_markup: str) -> str:
    start = index_html.find(START_MARKER)
    end = index_html.find(END_MARKER)

    if start == -1 or end == -1 or end <= start:
        raise RuntimeError("Could not find the auto-review markers in index.html.")

    start_content = start + len(START_MARKER)
    updated = (
        index_html[:start_content]
        + "\n"
        + reviews_markup
        + "\n                    "
        + index_html[end:]
    )
    return updated


def main() -> None:
    index_html = INDEX_PATH.read_text(encoding="utf-8")
    api_key = load_api_key(index_html)
    _, reviews = collect_reviews(api_key)
    updated_html = update_index_html(index_html, render_cards(reviews))

    if updated_html != index_html:
        INDEX_PATH.write_text(updated_html, encoding="utf-8")
        print(f"Updated {INDEX_PATH} with {len(reviews)} Google reviews.")
    else:
        print("No testimonial changes were needed.")


if __name__ == "__main__":
    main()
