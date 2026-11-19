# Plume Diary

Compare satellite views of the Fraser River mouth with daily flow measured upstream at Hope. [Open Plume Diary](https://coolcode.ca/plumediary/).

<!-- coolcode:guide -->
On June 21 and 28, 2021 the Hope gauge was 680 m³/s higher on the second date. Test all five travel-time assumptions, then compare the green-brown coastal band on June 21 with the lighter patch extending southwest on June 28. The June 14 image shows how cloud can hide the river mouth.
<!-- /coolcode:guide -->

## Data and interpretation

[NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) returns dated Terra/MODIS corrected-reflectance true-colour browse images for the same Fraser delta bounds. The four weekly images include cloud where present. All are north-up with the same orientation and scale. [Water Survey of Canada](https://api.weather.gc.ca/collections/hydrometric-daily-mean) provides daily mean discharge at Fraser River at Hope (08MF005). Flow coverage begins May 25 to support offsets up to seven days. Percentile ranks count the June 2021 daily means less than or equal to the selected discharge and divide by 30. All offsets use that same reference month, including gauge days in May. The image captions describe a visual review of the four downloaded scenes. A caption appears only when the source image matches the reviewed SHA-256 hash. Flow and the image can describe different water parcels. Tides, sediment supply, clouds, wind and sunlight are uncontrolled. The collector validates all image dimensions and the full gauge period before the scheduled workflow can commit changes. Each image and the gauge have source links.

## Reproducing the edition

Install Pillow to validate images. Run `python3 scripts/refresh.py` from the repository. The monthly GitHub Action checks the sources, validates the offline build and publishes changes. A failed retrieval leaves the previous release available. The retrieval date is separate from the observation period. Results are calculated locally in the browser from the bundled edition. Visitor selections are not uploaded.

Run `node --test tests/*.test.mjs`, `python3 -m unittest discover -s tests` and `python3 scripts/build.py`. Serve `dist/` to preview the standalone site. The Pages workflow also exercises the main interaction and responsive layout in Chromium.
