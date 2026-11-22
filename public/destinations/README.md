# Destination photos

Drop a photo per destination here, named after its `id` from `lib/data/destination-facts.json`:

```
public/destinations/barcelona-spain.jpg
public/destinations/lisbon-portugal.jpg
```

- Format: `.jpg`, landscape, ideally 1200×900 or larger.
- Only use photos you have the rights to use (your own, purchased, or explicitly
  license-free — e.g. CC0). Check the license before adding anything.
- A destination with no file here just falls back to the "Photos coming soon"
  placeholder — nothing breaks if it's missing.
- After adding photos, run `yarn data:photos` to refresh `lib/data/destination-photos.json`
  (it also runs on every `yarn build`). Every destination listed there takes a turn as the
  homepage hero, changing daily at UK midnight — so landscape shots with some calm space on the
  left, where the heading and form sit, work best.
