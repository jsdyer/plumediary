"""Compare the same geographic crop with observed daily mean flow at Hope."""
import json
from io import BytesIO
from urllib.parse import urlencode
from hashlib import sha256
from PIL import Image
from source import fetch, store, DATA

GAUGE = 'https://api.weather.gc.ca/collections/hydrometric-daily-mean/items?'
GIBS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?'
SCENES = ['2021-06-07','2021-06-14','2021-06-21','2021-06-28']
BBOX = '-123.65,48.94,-122.96,49.36'

def collect():
    gauge_url = GAUGE+urlencode({'STATION_NUMBER':'08MF005','datetime':'2021-05-25/2021-06-30','limit':100,'f':'json'})
    series = json.loads(fetch(gauge_url))
    flow = {}
    for record in series['features']:
        row = record['properties']
        if row['STATION_NUMBER']!='08MF005' or row['DATE'] in flow:
            raise ValueError('Unexpected gauge or duplicate day')
        flow[row['DATE']] = row['DISCHARGE']
    if len(flow)!=37 or any(flow.get(day) is None for day in SCENES):
        raise ValueError('Missing June gauge coverage')
    images = {}
    scenes = []
    for day in SCENES:
        params = dict(SERVICE='WMS',VERSION='1.1.1',REQUEST='GetMap',LAYERS='MODIS_Terra_CorrectedReflectance_TrueColor',
                      STYLES='',SRS='EPSG:4326',BBOX=BBOX,WIDTH=680,HEIGHT=615,FORMAT='image/jpeg',TIME=day)
        url = GIBS+urlencode(params)
        raw = fetch(url)
        with Image.open(BytesIO(raw)) as im:
            im.load()
            if im.format!='JPEG' or im.size!=(680,615) or sum(hi-lo for lo,hi in im.convert('RGB').getextrema())<30:
                raise ValueError('Missing or invalid satellite scene '+day)
        file = day+'.jpg'
        images[file] = raw
        scenes.append(dict(date=day,image=file,source=url,sha256=sha256(raw).hexdigest()))
    DATA.mkdir(exist_ok=True)
    for name, raw in images.items():
        (DATA/name).write_bytes(raw)
    store(dict(coverage='Fraser delta · June 2021',count=len(scenes),scenes=scenes,flow=flow,gauge=gauge_url,bbox=BBOX))

if __name__ == '__main__':
    collect()
