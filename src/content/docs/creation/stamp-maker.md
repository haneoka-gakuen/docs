---
title: Stamp maker
description: Choose a stamp version, compose independent text layers, and download a square PNG up to 512 × 512 pixels.
---

Use the [stamp maker](https://haneoka.org/en/stamp-maker/) to add your own text to the site's stamp images. Choose the image version, arrange one or more text layers, and download the composition as a PNG. The tool runs in your browser and needs no project installation.

## Make your first stamp

1. Open **Choose stamp**.
2. In the chooser, select Japanese, English, Traditional Chinese, Simplified Chinese, Korean, or **Textless**. Click a stamp card to use it and close the chooser.
3. Enter a short caption in **Text**. Select its writing direction, font, size, and color.
4. Drag the text in the preview to place it. Open **Position and outline** for exact position, rotation, and outline settings.
5. Choose **Export size**, then click **Export PNG**.

On a phone, the image selector and preview remain visible while the editing panel scrolls. Scroll inside that panel to reach the remaining controls. Edits are saved as a local draft in this browser. Reopening the tool restores the image and text layers; downloading a PNG saves their combined appearance.

## Choose the image and its language

New compositions start with **Textless**. When choosing a language version, the default follows the page language; a language you choose explicitly is retained. Close the chooser with the top-right button or Escape.

Language and **Textless** are alternatives in the same selector inside **Choose stamp**. They select the image you edit; the interface language stays unchanged. For example, you can use an English stamp while keeping the interface in Chinese.

The cards show the actual image version. Some images are shared across languages and retain their original artwork. **Textless** lists the available reviewed images, so its selection can differ from the language lists. Choose another language to return to an image with its existing text.

The site's source image stays intact when you add text. Changing the text field edits your new caption. For replacing existing lettering, choose a textless image or use the [text background](#cover-existing-lettering-with-a-text-background) controls.

Images come from the site's stamp catalog. The tool does not accept image uploads. You can import a local font through the command beside **Font**.

## Work with image and text layers

Each text layer has its own caption, font and usable weight, color, outline, position, rotation, writing direction, and optional background. Use separate layers for captions in different parts of the image.

| Control | What it does |
| --- | --- |
| **Layer** | Select a layer by its number and caption. The list presents the foreground layers first. |
| **Add text** | Create and select an empty layer using the current text style, with its background off. |
| **Layer actions → Duplicate layer** | Copy the selected layer's text and style, including its background. The copy is slightly offset so you can separate it from the original. |
| **Layer actions → Delete layer** | Remove the selected text layer. The tool keeps at least one text layer. |
| **Bring forward / Send backward** | Move the selected layer by one position in the drawing order. |
| **Reset selected layer** | Reset the selected text style while preserving its caption, or restore the image's centered position, 100% scale, and zero rotation. |

Select **Stamp image** in **Layer** to move, rotate, or scale the image. Image scale ranges from 10% to 300%, and 100% uses its effective source dimensions within the 512-pixel square canvas. Smaller sources are centered with transparent padding. The image can move forward or backward among the text layers; the preview and exported PNG use that same order. The tool retains one image layer and at least one text layer.

The editor supports up to 12 text layers, with up to 500 characters in each text field. Click a text area in the preview to select and drag its layer. When areas overlap, the upper layer receives the click; use **Layer** to select one underneath.

For precise positioning, open **Position and outline**. Horizontal and vertical positions are percentages of the image canvas, and rotation is in degrees. With the preview focused, arrow keys move the selected layer by one percentage point; hold Shift to move by five. **Center layer** places its anchor at the center.

## Horizontal and vertical writing

The writing-direction control provides **Horizontal**, **Vertical ←**, and **Vertical →**. The arrows describe the order of columns: leftward starts on the right, and rightward starts on the left.

In vertical writing, a newline starts another column. Longer columns wrap to additional columns. CJK characters stay upright, Latin runs turn sideways, one or two ASCII digits can share an upright cell, and punctuation is positioned or rotated for the column. You can give each layer a different direction.

The preview, pointer selection, and PNG use the same text layout. Adjust the font size and position while watching the preview, especially when mixing scripts or making a long caption.

## Fonts and character colors

Choose a font from **Font** and wait for loading to finish before exporting. The available families serve different purposes:

| Font | Use and available weight |
| --- | --- |
| **YurukaStd** | A font used by the referenced Sekai sticker tool; its provided face is UB, weight 900. |
| **SSFangTangTi** | The Sekai tool's ShangShou FangTang face, with its provided weight 400. |
| **Roboto** | Variable weight 100–900. |
| **Noto Sans SC / TC / JP / KR** | Regional CJK sans families, variable weight 100–900. |
| **Noto Serif SC / TC / JP / KR** | Regional CJK serif families, variable weight 200–900. |
| **Original runtime UI · Pretendard SemiBold** | An Our Notes runtime UI face at its actual weight 600. |

Variable families expose a **Font weight** control and start at the strongest available weight. Fixed faces keep their supplied weight. Font coverage varies by family; choose a suitable regional family if a character is missing.

The Sekai fonts identify the referenced tool's typography. Pretendard identifies a runtime UI face. The original Our Notes stamp lettering is part of its images; its authoring font has not been identified, so neither label establishes the typeface of that baked lettering.

Use **Import local font** beside the font field to load WOFF2, WOFF, TTF, or OTF from your device. The imported font appears by filename and is used in the current page. Individual font files can be up to 32 MiB. Reimport the file when restoring a draft that uses it.

**Text color** provides character presets with a name, portrait, and actual color swatch. A stamp's associated character can supply the initial color; you can choose any listed character or **Custom color**. Color selections belong to the selected text layer.

## Cover existing lettering with a text background

Open **Position and outline → Text background** for the selected layer, then enable its background. Choose a character-color preset or a custom background color and adjust:

- **Background opacity**: 100% makes it opaque; a lower value lets the image show through.
- **Background padding**: space outside the actual lettering and its outline. It starts at 0, so the edge fits closely.
- **Background radius**: rounding at the rectangle's corners.

The background follows that layer's position and rotation. Place it over the old lettering and check that it covers the area you intend. It is a text-layer rectangle; the original image remains intact underneath. Returning to **No background** removes the rectangle.

Outline color and width are in the same secondary panel. The preview selection guide is an editing aid and does not appear in the downloaded PNG.

## Save and restore a local draft

After editing, the tool saves the selected stamp, image language, image position and scale, text-layer styles and drawing order in this browser. Reopen the tool and wait for its resources to load to restore the draft. The draft menu can also restore the last saved content or clear the local draft.

The draft belongs to this device's browser. Clearing site data deletes it; it does not sync to other devices. Reimport any local font files when the missing-font notice appears. If the original stamp resource is unavailable, check the image notice and choose another stamp; the text layers remain editable. PNG export saves the combined image, while the draft saves editable settings.

## Export a square PNG

**Export size** offers 128 × 128, 256 × 256, 384 × 384, and 512 × 512 pixels. Every composition uses the same square canvas. The largest download is 512 × 512 regardless of the source image dimensions.

A 346 × 398 source starts centered at that size on the 512 × 512 canvas, surrounded by transparent padding. Larger source images fit within the canvas. You can deliberately enlarge an image with **Image scale** when composing it; scaling changes its size without adding source detail.

Smaller exports scale the complete composition, including its image, text, outline, and background. Export captures every layer's settings and order when it starts, keeps transparency, and omits the selection guide. The downloaded PNG saves the combined image.

## Example: a caption and a side note

1. Choose an available textless stamp in **Choose stamp**.
2. Write a short horizontal caption in the first layer. Pick a font and character color, then drag it above the character.
3. Use **Add text**, enter a side note, and choose **Vertical ←**. Place it beside the character without changing the first caption.
4. If the captions overlap, select the intended layer from **Layer** and use **Bring forward** or **Send backward**.
5. Export **512 × 512 px** for your main copy, or a smaller size for an application that needs a compact PNG.

## When something needs adjustment

| What you see | What to do |
| --- | --- |
| An image fails to load | Use **Retry**. You can reopen the chooser and pick another available image. |
| A font fails to load | Retry or choose another font. Font loading finishes before export is enabled. |
| A glyph looks missing or different | Select a family covering that script, or import a suitable local font. |
| Text sits outside the picture | Select its layer, reduce the size, adjust its position, or use **Center layer**. |
| You cannot pick the lower caption | Select it from **Layer**, or change the layer order. |
| The old caption remains visible | Choose a textless image, or place an opaque text background over the old lettering. |
| A larger download size is absent | Choose **512 × 512 px**, the maximum composition size. |
