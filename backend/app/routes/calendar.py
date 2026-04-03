import json
from functools import lru_cache
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/calendar", tags=["calendar"])


@lru_cache(maxsize=24)
def fetch_public_holidays(year: int, country_code: str) -> list[dict]:
    url = f"https://date.nager.at/api/v3/publicholidays/{year}/{country_code.upper()}"

    try:
        with urlopen(url, timeout=10) as response:
            payload = response.read().decode("utf-8")
            data = json.loads(payload)
    except HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"No pudimos consultar los feriados para {country_code.upper()} en {year}.",
        ) from error
    except URLError as error:
        raise HTTPException(
            status_code=502,
            detail="No pudimos conectarnos al servicio externo de feriados.",
        ) from error

    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Respuesta inesperada del servicio de feriados.")

    return data


@router.get("/holidays/{year}/{country_code}")
def get_public_holidays(year: int, country_code: str):
    holidays = fetch_public_holidays(year, country_code)
    return {
      "year": year,
      "country_code": country_code.upper(),
      "dates": [holiday["date"] for holiday in holidays if isinstance(holiday, dict) and holiday.get("date")],
      "items": holidays,
    }
