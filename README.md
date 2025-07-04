Circuit Snippets
================

Source code for [circuitsnippets.com](https://circuitsnippets.com).

It turns out that kicad uses the OS clipboard for *all* clipboard operations.
It's incredibly nice, and means you can seamlessly paste between two kicads that are running, or save snippets of a schematic or layout into a text file.

It also means that you can make a website that puts snippets of kicad schematic directly into your clipboard, which you can then paste directly into kicad.
It's always so annoying to me to make buck converters, so I made [circuitsnippets.com](https://circuitsnippets.com), which lets you pick a buck part and a target voltage, and it generates a schematic snippet that's 100% populated with footprints and LCSC part numbers.


Potential issue
---------------

Note that right now there might be an issue where it only works to paste into kicad 9.
If the circuit snippet pastes as text (rather than schematic), as shown below, please let me know what kicad version you're in!


Contributing
------------

To run this you just need to do:
```bash
npm install
npm run dev
```
And then navigate to localhost.

To make a new part you just need to:
1. Make a new directory in `templates/`
2. Create a new kicad project in the new directory.
3. Create `Widget.tsx` file in the new directory, which exports a variable called `deviceInfoYourPartName` of type `DeviceInfo`.
4. In `src/App.tsx` make four changes:
	a. Add an import for your `Widget.tsx`,
	b. extend `DEVICE_LIST`,
	c. extend `deviceInfoTable`,
	d. and add a `<DeviceButton>` in the appropriate section for your category of device.


License
-------

Everything here is CC0/public domain.
You may do anything you want with any of it.
