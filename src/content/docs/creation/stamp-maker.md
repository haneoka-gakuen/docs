---
title: Stamp maker
description: Choose a stamp version, compose independent text layers, and download a PNG at its original size or a smaller size.
---

Use the [stamp maker](https://haneoka.org/en/stamp-maker/) to add your own text to the site's stamp images. Choose the image version, arrange one or more text layers, and download the composition as a PNG. The tool runs in your browser and needs no project installation.

## Make your first stamp

1. Open **Choose stamp**.
2. In the chooser, select Japanese, English, Traditional Chinese, Simplified Chinese, Korean, or **Textless**. Click a stamp card to use it and close the chooser.
3. Enter a short caption in **Text**. Select its writing direction, font, size, and color.
4. Drag the text in the preview to place it. Open **Position and outline** for exact position, rotation, and outline settings.
5. Choose **Export size**, then click **Export PNG**.

On a phone, the image selector and preview remain visible while the editing panel scrolls. Scroll inside that panel to reach the remaining controls. Save a PNG before refreshing or leaving the page: the editable layers belong to the current page, and the PNG saves their combined appearance.

## Choose the image and its language

Language and **Textless** are alternatives in the same selector inside **Choose stamp**. They select the image you edit; the interface language stays unchanged. For example, you can use an English stamp while keeping the interface in Chinese.

The cards show the actual image version. Some images are shared across languages and retain their original artwork. **Textless** lists the available reviewed images, so its selection can differ from the language lists. Choose another language to return to an image with its existing text.

The site's source image stays intact when you add text. Changing the text field edits your new caption. For replacing existing lettering, choose a textless image or use the [text background](#cover-existing-lettering-with-a-text-background) controls.

Images come from the site's stamp catalog. The tool does not accept image uploads. You can import a local font through the command beside **Font**.

## Work with independent text layers

Each text layer has its own caption, font and usable weight, color, outline, position, rotation, writing direction, and optional background. Use separate layers for captions in different parts of the image.

| Control | What it does |
| --- | --- |
| **Text layer** | Select a layer by its number and caption. The list presents the foreground layers first. |
| **Add text** | Create and select an empty layer using the current text style, with its background off. |
| **Layer actions → Duplicate layer** | Copy the selected layer's text and style, including its background. The copy is slightly offset so you can separate it from the original. |
| **Layer actions → Delete layer** | Remove the selected layer. The tool keeps at least one layer. |
| **Bring forward / Send backward** | Move the selected layer by one position in the drawing order. |
| **Reset selected text style** | Reset the current layer's style while preserving its text and the other layers. |

The editor supports up to 12 layers, with up to 500 characters in each text field. Click a text area in the preview to select and drag its layer. When areas overlap, the upper layer receives the click; use **Text layer** to select one underneath.

For precise positioning, open **Position and outline**. Horizontal and vertical positions are percentages of the image canvas, and rotation is in degrees. With the preview focused, arrow keys move the selected layer by one percentage point; hold Shift to move by five. **Center text** places its anchor at the center.

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

Use **Import local font** beside the font field to load WOFF2, WOFF, TTF, or OTF from your device. The imported font appears by filename and is used in the current page. Individual font files can be up to 32 MiB. Import it again when starting a new page session.

**Text color** provides character presets with a name, portrait, and actual color swatch. A stamp's associated character can supply the initial color; you can choose any listed character or **Custom color**. Color selections belong to the selected text layer.

## Cover existing lettering with a text background

Open **Position and outline → Text background** for the selected layer, then enable its background. Choose a character-color preset or a custom background color and adjust:

- **Background opacity**: 100% makes it opaque; a lower value lets the image show through.
- **Background padding**: space outside the actual lettering and its outline. It starts at 0, so the edge fits closely.
- **Background radius**: rounding at the rectangle's corners.

The background follows that layer's position and rotation. Place it over the old lettering and check that it covers the area you intend. It is a text-layer rectangle; the original image remains intact underneath. Returning to **No background** removes the rectangle.

Outline color and width are in the same secondary panel. The preview selection guide is an editing aid and does not appear in the downloaded PNG.

## Export at the original size or downsample

**Export size** shows **Original size** with its actual width and height, plus smaller dimensions that fit the source. The available choices change with the selected image.

For a 346 × 398 source, for example, the menu offers 128 × 147, 192 × 221, 256 × 294, 320 × 368, and the original 346 × 398. A 512 × 512 source can offer smaller square choices such as 128, 192, 256, 320, and 384 pixels, plus its original size.

A smaller choice renders a genuinely smaller PNG. The image, text, outline, and background retain their relative positions and proportions. **Original size** preserves a non-square source's dimensions and aspect ratio. The preview's display size does not determine the export limit, and an enlarged derivative does not raise the effective original-size limit.

Export includes every text layer in its drawing order, not just the selected layer, and retains the composition's transparency. The export captures the layer settings when it starts. Download the finished PNG to save the result; it is a flattened image rather than an editable project.

## Example: a caption and a side note

1. Choose an available textless stamp in **Choose stamp**.
2. Write a short horizontal caption in the first layer. Pick a font and character color, then drag it above the character.
3. Use **Add text**, enter a side note, and choose **Vertical ←**. Place it beside the character without changing the first caption.
4. If the captions overlap, select the intended layer from **Text layer** and use **Bring forward** or **Send backward**.
5. Export **Original size** for your main copy, or a smaller size for an application that needs a compact PNG.

## When something needs adjustment

| What you see | What to do |
| --- | --- |
| An image fails to load | Use **Retry**. You can reopen the chooser and pick another available image. |
| A font fails to load | Retry or choose another font. Font loading finishes before export is enabled. |
| A glyph looks missing or different | Select a family covering that script, or import a suitable local font. |
| Text sits outside the picture | Select its layer, reduce the size, adjust its position, or use **Center text**. |
| You cannot pick the lower caption | Select it from **Text layer**, or change the layer order. |
| The old caption remains visible | Choose a textless image, or place an opaque text background over the old lettering. |
| A larger download size is absent | Use **Original size** for the full effective source resolution. |
