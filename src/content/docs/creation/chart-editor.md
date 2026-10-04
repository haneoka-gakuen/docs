---
title: Create a chart with local audio
description: Import audio, place notes, preview and save portable chart projects.
---

[Open the creator](https://haneoka.org/en/chart-editor/create/) · [Haneoka](https://haneoka.org/)

The first release provides local audio, single-object chart editing, timing, presentation preview, browser-local versions and portable exports. Start with the complete small sample, then replace its audio or chart with your own files.

## 1. Open the complete starter

1. Download [local-demo.zip](/examples/creator/local-demo.zip).
2. Open [the creator](https://haneoka.org/en/chart-editor/create/).
3. Click **Open backup** and select this ZIP directly. It is a native creator backup, rather than a folder archive to extract.
4. Wait for **Local audio starter**: an eight-second original 120 BPM click track and three editable notes.
5. Click **Play** in the preview and use the same button to pause. The actual audio clock drives the authoring canvas; this preview presents notes without judgement or scoring.

Backup import creates a new local project and preserves the previous saved project.

## 2. Choose JSON and audio separately

Save [Haneoka-120bpm.wav](/examples/creator/Haneoka-120bpm.wav) and [local-demo.project.json](/examples/creator/local-demo.project.json) into one folder:

```text
my-chart/
  Haneoka-120bpm.wav
  local-demo.project.json
```

1. Click **Load local audio**, select the WAV and wait for its name and duration.
2. Click **Import local chart** and select the Project JSON.
3. Click **Play** to inspect the three notes. JSON contains editable Project data; audio is selected separately.
4. Click **Save version** before closing the page or replacing the source.

Audio must be browser-decodable, at most **32 MiB**, **600 seconds** and **8 channels**. The original encoded file is saved; decoded PCM is transient. Waveform analysis provides up to three BPM candidates locally. Selecting one applies it; enter BPM yourself when appropriate. Half/double-tempo candidates can describe the same rhythm.

Chart import accepts **Project JSON, Our Notes/SS JSON, USC v2 and SUS text**, up to **2 MiB**. Sonolus LevelData is a deployment format, not editable Project input. The playback ChartDocument in the [Cassiopeia tutorial](../../embed/cassiopeia/) is another format; this creator uses the supplied Project JSON.

## 3. Place and inspect notes

Select Tap, Flick or Trace and click the editing grid. The default coordinate basis is 24, displayed as six groups of width 4. Hold and Guide need a start followed by a later endpoint; Escape clears a pending endpoint.

Select chooses a note or line point. Edit its beat, lane, width, type, critical flag and visibility; Flick has left/up/right direction, and line points also have left/right easing. Erase removes a hit single note or its complete connector. Copying a selected line point copies that whole connector. Paste inserts at the current audio position with new IDs.

| Control | Default / available values | Purpose |
| --- | --- | --- |
| Tool | Tap / select, tap, flick, trace, hold, guide, erase, pan | Selection, placement, deletion or view panning. |
| Snap | 1/4 / 1/1, 1/2, 1/3, 1/4, 1/6, 1/8, 1/12, 1/16 | Musical subdivision for placement/paste. |
| Visible time span | 4 s / .5, 1, 2, 4, 8, 16 s and wheel-derived values | View zoom; authored timing is preserved. |
| Playback speed | 1× / .25, .5, .75, 1, 1.25, 1.5, 2× | Audio preview speed. |
| New Critical | false | Default flag for new notes. |
| New Flick direction | up / left, up, right | Default for new Flick notes. |
| Insertion lane | 0, clamped to the visible span | Add a note at the current music position by button. |
| Initial BPM | 120, finite positive | Initial project tempo; candidates change only this event. |
| Audio offset | 0, finite seconds | Seconds added to musical time zero. |

Project edits title, artist, charter, initial BPM and audio offset. Add BPM inserts at the current snapped position, rejecting duplicate ticks. Time scale adds positive scroll-scale events. The JSON retains meter events and source extensions.

Wheel pans time; Ctrl/Command+wheel zooms around pointer time; Pan drags the view. Go to playhead follows the music, and the Beat field seeks the preview. These operations retain authored timings.

## 4. Save, restore and export

Save version stores an edit. Saved charts reopens a local project; Versions restores a snapshot. Saving edits from an old version creates a new version on its increasing local history. The workspace saves the dirty chart before switching saved projects or exporting.

Audio and versions live in this browser's IndexedDB. Clearing site storage removes the local library, so keep an exported backup. A newer save in another tab causes a conflict: reopen the saved project or Save a copy to preserve the current draft separately.

| Download | Contents |
| --- | --- |
| Backup ZIP | Original chart, current snapshot, optional original source text, and original/current encoded audio by SHA-256. Open backup reads it. The complete local revision history stays in the browser. |
| Haneoka Project JSON | Complete editable chart with extensions/markers. Audio remains a separate file. |
| Our Notes/SS or USC v2 | Converted chart JSON. The visible format warnings list omitted or normalized fields. Keep the Project or backup for further authoring. |

SUS is import-only in this first release. A backup has `project.yaml` containing JSON (valid YAML 1.2) and at most two `audio/<sha256>` entries. Import validates charts, envelope and audio hashes; at most three entries fit a 4 MiB manifest plus two 32 MiB audio budgets. Use the creator's export to make backups.

## Complete Project JSON fields

The sample contains all required fields: version 1, resolution 480, laneBasis 24. One beat is 480 ticks; at 120 BPM its tick-480 first note is at .5 seconds.

| Field | Type / constraints |
| --- | --- |
| version / resolution | Literals 1 / 480. |
| laneBasis | Finite positive, default 24; source formats may retain another basis. |
| meta | Required string title/artist/charter/difficulty/level; optional source:string, tags:string[], extra:JSON object. |
| audioOffset | Finite seconds. |
| tempos | Nonempty `{id,tick,bpm}[]`, unique nonnegative safe-integer ticks, tick-0 event, finite positive BPM. |
| meters | Nonempty `{id,tick,numerator,denominator}[]`, positive safe-integer numerator, denominator a positive power of two, unique nonnegative ticks. |
| timeScales | `{id,tick,scale}[]`, unique nonnegative safe-integer ticks, finite positive scale. |
| singles | Single-note array described below. |
| lines | `{id,kind:"long"|"guide",critical?:boolean,points:LinePoint[]}[]`, at least two points in nondecreasing tick order. |
| markers | `{skill:number[],fever:[number,number][],call:{tick:number,timing:number[]}[]}`, nonnegative safe-integer ticks, finite call timing values. |
| extensions | Required JSON object for source-specific data. |
| sourceOrder | Optional string[] for source object order. |

Each note has a unique nonempty `id`, nonnegative safe-integer `tick`, finite `lane`, nonnegative finite `size`, `type:"tap"|"flick"|"trace"`, boolean critical/visible, and direction none/left/up/right. Tap uses none. IDs are unique across notes, connectors and timing events. Out-of-stage spans produce warnings and keep authored values.

Line points add `ease:{left:"linear"|"in"|"out",right:"linear"|"in"|"out"}`. Their lane can be `"auto"`; optional resolvedLane/resolvedSize/autoSize preserve imported interpolation data. Begin with the complete sample; validation identifies invalid fields.

## Shortcuts and recovery

With canvas focus: Ctrl/Command+S saves, Ctrl/Command+Z undoes, Ctrl/Command+Shift+Z or Ctrl/Command+Y redoes, and Ctrl/Command+C/V copies/pastes. Delete/Backspace erases, Space plays/pauses, Escape clears selection/pending endpoint, 1–7 selects select/tap/flick/trace/hold/guide/erase, and Up/Down moves the editing window. Text and Material inputs retain normal keys.

For audio errors, try the small WAV, check limits and choose a browser-supported codec. Missing audio/hash errors need a complete exported backup. Close another tab for storage conflicts or blocked database access; export a backup before freeing storage. This first slice covers local single-object authoring and presentation preview; advanced editing and source-platform/publication integrations have separate rollout scopes.
