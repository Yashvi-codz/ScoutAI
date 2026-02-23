# utils/downloader.py
import requests

def download_video(url, save_path):
    response = requests.get(url, stream=True)

    if response.status_code != 200:
        raise Exception("Failed to download video")

    with open(save_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)