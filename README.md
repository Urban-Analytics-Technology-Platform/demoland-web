# Favicon generation

The current favicon is an outline of Tyne and Wear, split into four 'areas' which are coloured differently (the colours are random / personal preference).

To regenerate the favicon, perhaps with different area divisions / colours, do the following:

- Open `tynewear.svg` in Inkscape
- Duplicate the Tyne and Wear shape
- Select the duplicate and one of the squares. Then do *Path > Intersection*
- Repeat with the other squares. You should now have four separate shapes, which can be filled with whatever colour you choose. To change the 'areas', just modify the initial shapes which are being intersected with.

The Tyne and Wear shape was obtained from a Google Image search, followed by *Path > Trace Bitmap*.
This gives a shape with an 'outer' and 'inner' border.
To convert this into a single shape, the inner border must be removed: to do this, use *Path > Break Apart*.
This generates outer and inner filled shapes. At this point, you can delete the inner shape.
