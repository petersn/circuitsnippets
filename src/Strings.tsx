
export const US_RESISTOR_TEMPLATE: string = `(lib_symbols
	(symbol "Device:R_US"
		(pin_numbers
			(hide yes)
		)
		(pin_names
			(offset 0)
		)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(property "Reference" "R"
			(at 2.54 0 90)
			(effects
				(font (size 1.27 1.27))
			)
		)
		(property "Value" "R_US"
			(at -2.54 0 90)
			(effects
				(font (size 1.27 1.27))
			)
		)
		(property "Footprint" ""
			(at 1.016 -0.254 90)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Datasheet" "~"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Description" "Resistor, US symbol"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "ki_keywords" "R res resistor"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "ki_fp_filters" "R_*"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(symbol "R_US_0_1"
			(polyline
				(pts
					(xy 0 2.286) (xy 0 2.54)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
			(polyline
				(pts
					(xy 0 2.286) (xy 1.016 1.905) (xy 0 1.524) (xy -1.016 1.143) (xy 0 0.762)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
			(polyline
				(pts
					(xy 0 0.762) (xy 1.016 0.381) (xy 0 0) (xy -1.016 -0.381) (xy 0 -0.762)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
			(polyline
				(pts
					(xy 0 -0.762) (xy 1.016 -1.143) (xy 0 -1.524) (xy -1.016 -1.905) (xy 0 -2.286)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
			(polyline
				(pts
					(xy 0 -2.286) (xy 0 -2.54)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
		)
		(symbol "R_US_1_1"
			(pin passive line
				(at 0 3.81 270)
				(length 1.27)
				(name "~"
					(effects
						(font (size 1.27 1.27))
					)
				)
				(number "1"
					(effects
						(font (size 1.27 1.27))
					)
				)
			)
			(pin passive line
				(at 0 -3.81 90)
				(length 1.27)
				(name "~"
					(effects
						(font (size 1.27 1.27))
					)
				)
				(number "2"
					(effects
						(font (size 1.27 1.27))
					)
				)
			)
		)
		(embedded_fonts no)
	)
)
(symbol
	(lib_id "Device:R_US")
	(at 334.01 130.81 0)
	(unit 1)
	(exclude_from_sim no)
	(in_bom yes)
	(on_board yes)
	(dnp no)
	(fields_autoplaced yes)
	(uuid "9a30816f-4a5a-4cd5-ab64-fac43e1b216e")
	(property "Reference" "R59"
		(at 336.55 129.5399 0)
		(effects
			(font (size 1.27 1.27))
			(justify left)
		)
	)
	(property "Value" "R_US"
		(at 336.55 132.0799 0)
		(effects
			(font (size 1.27 1.27))
			(justify left)
		)
	)
	(property "Footprint" ""
		(at 335.026 131.064 90)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Datasheet" "~"
		(at 334.01 130.81 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Description" "Resistor, US symbol"
		(at 334.01 130.81 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(pin "1"
		(uuid "c4e4adcd-06e7-48a8-85e6-bbc61a0e27ba")
	)
	(pin "2"
		(uuid "103477a7-9cd5-4bae-b2b2-ef2c07c3df70")
	)
	(instances
		(project ""
			(path ""
				(reference "R59")
				(unit 1)
			)
		)
	)
)
`;

export const MLCC_TEMPLATE: string = `(lib_symbols
	(symbol "Device:C"
		(pin_numbers
			(hide yes)
		)
		(pin_names
			(offset 0.254)
		)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(property "Reference" "C"
			(at 0.635 2.54 0)
			(effects
				(font (size 1.27 1.27))
				(justify left)
			)
		)
		(property "Value" "C"
			(at 0.635 -2.54 0)
			(effects
				(font (size 1.27 1.27))
				(justify left)
			)
		)
		(property "Footprint" ""
			(at 0.9652 -3.81 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Datasheet" "~"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Description" "Unpolarized capacitor"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "ki_keywords" "cap capacitor"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "ki_fp_filters" "C_*"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(symbol "C_0_1"
			(polyline
				(pts
					(xy -2.032 0.762) (xy 2.032 0.762)
				)
				(stroke (width 0.508) (type default))
				(fill (type none))
			)
			(polyline
				(pts
					(xy -2.032 -0.762) (xy 2.032 -0.762)
				)
				(stroke (width 0.508) (type default))
				(fill (type none))
			)
		)
		(symbol "C_1_1"
			(pin passive line
				(at 0 3.81 270)
				(length 2.794)
				(name "~"
					(effects
						(font (size 1.27 1.27))
					)
				)
				(number "1"
					(effects
						(font (size 1.27 1.27))
					)
				)
			)
			(pin passive line
				(at 0 -3.81 90)
				(length 2.794)
				(name "~"
					(effects
						(font (size 1.27 1.27))
					)
				)
				(number "2"
					(effects
						(font (size 1.27 1.27))
					)
				)
			)
		)
		(embedded_fonts no)
	)
)
(wire
	(pts
		(xy 0 8.89) (xy 0 10.16)
	)
	(stroke (width 0) (type default))
	(uuid "dcf51444-b55c-4fe8-a8f9-3bb495ca8fdf")
)
(wire
	(pts
		(xy 0 1.27) (xy 0 0)
	)
	(stroke (width 0) (type default))
	(uuid "cbf0f03d-fa01-407c-b9bb-711b809908a6")
)
(symbol
	(lib_id "Device:C")
	(at 0 5.08 0)
	(unit 1)
	(exclude_from_sim no)
	(in_bom yes)
	(on_board yes)
	(dnp no)
	(uuid "622433bd-be06-4c37-9e73-fae484cf947c")
	(property "Reference" "C8"
		(at 2.921 3.9116 0)
		(effects
			(font (size 1.27 1.27))
			(justify left)
		)
	)
	(property "Value" "{{MLCCvalue}}"
		(at 2.921 6.223 0)
		(effects
			(font (size 1.27 1.27))
			(justify left)
		)
	)
	(property "Footprint" "{{MLCCfootprint}}"
		(at 0.9652 8.89 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Datasheet" "{{MLCCdatasheet}}"
		(at 0 5.08 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Description" ""
		(at 0 5.08 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "LCSC" "{{MLCClcsc}}"
		(at 0 5.08 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(pin "1"
		(uuid "25b3acd4-d4d4-4363-999b-a29b86a6b984")
	)
	(pin "2"
		(uuid "53860763-bf2f-4dfd-9819-6a49e76672ff")
	)
	(instances
		(project "template"
			(path ""
				(reference "C8")
				(unit 1)
			)
		)
	)
)
(wire
	(pts
		(xy -12.7 0) (xy 0 0)
	)
	(stroke (width 0) (type default))
	(uuid "e9bbbc54-67dd-4f3e-aa88-8f3a32ce245a")
)
(wire
	(pts
		(xy -12.7 10.16) (xy 0 10.16)
	)
	(stroke (width 0) (type default))
	(uuid "2c2724eb-9010-43c0-bec9-dfd1b31be241")
)`;

export const AL_POLY_TEMPLATE: string = `(lib_symbols
	(symbol "Device:C_Polarized_US"
		(pin_numbers
			(hide yes)
		)
		(pin_names
			(offset 0.254)
			(hide yes)
		)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(property "Reference" "C"
			(at 0.635 2.54 0)
			(effects
				(font (size 1.27 1.27))
				(justify left)
			)
		)
		(property "Value" "C_Polarized_US"
			(at 0.635 -2.54 0)
			(effects
				(font (size 1.27 1.27))
				(justify left)
			)
		)
		(property "Footprint" ""
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Datasheet" "~"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Description" "Polarized capacitor, US symbol"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "ki_keywords" "cap capacitor"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "ki_fp_filters" "CP_*"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(symbol "C_Polarized_US_0_1"
			(polyline
				(pts
					(xy -2.032 0.762) (xy 2.032 0.762)
				)
				(stroke (width 0.508) (type default))
				(fill (type none))
			)
			(polyline
				(pts
					(xy -1.778 2.286) (xy -0.762 2.286)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
			(polyline
				(pts
					(xy -1.27 1.778) (xy -1.27 2.794)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
			(arc
				(start -2.032 -1.27)
				(mid 0 -0.5572)
				(end 2.032 -1.27)
				(stroke (width 0.508) (type default))
				(fill (type none))
			)
		)
		(symbol "C_Polarized_US_1_1"
			(pin passive line
				(at 0 3.81 270)
				(length 2.794)
				(name "~"
					(effects
						(font (size 1.27 1.27))
					)
				)
				(number "1"
					(effects
						(font (size 1.27 1.27))
					)
				)
			)
			(pin passive line
				(at 0 -3.81 90)
				(length 3.302)
				(name "~"
					(effects
						(font (size 1.27 1.27))
					)
				)
				(number "2"
					(effects
						(font (size 1.27 1.27))
					)
				)
			)
		)
		(embedded_fonts no)
	)
)
(wire
	(pts
		(xy 0 8.89) (xy 0 10.16)
	)
	(stroke (width 0) (type default))
	(uuid "dcf51444-b55c-4fe8-a8f9-3bb495ca8fdf")
)
(wire
	(pts
		(xy 0 1.27) (xy 0 0)
	)
	(stroke (width 0) (type default))
	(uuid "cbf0f03d-fa01-407c-b9bb-711b809908a6")
)
(wire
	(pts
		(xy -12.7 0) (xy 0 0)
	)
	(stroke (width 0) (type default))
	(uuid "e9bbbc54-67dd-4f3e-aa88-8f3a32ce245a")
)
(wire
	(pts
		(xy -12.7 10.16) (xy 0 10.16)
	)
	(stroke (width 0) (type default))
	(uuid "2c2724eb-9010-43c0-bec9-dfd1b31be241")
)
(symbol
	(lib_id "Device:C_Polarized_US")
	(at 0 5.08 0)
	(unit 1)
	(exclude_from_sim no)
	(in_bom yes)
	(on_board yes)
	(dnp no)
	(uuid "2beb4493-8b91-43a9-9492-fbe4316cb31c")
	(property "Reference" "C16"
		(at 2.921 3.81 0)
		(effects
			(font (size 1.27 1.27))
			(justify left)
		)
	)
	(property "Value" "{{AlPolyvalue}}"
		(at 2.921 6.35 0)
		(effects
			(font (size 1.27 1.27))
			(justify left)
		)
	)
	(property "Footprint" "{{AlPolyfootprint}}"
		(at 0 5.08 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Datasheet" "~"
		(at 0 5.08 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Description" "Polarized capacitor, US symbol"
		(at 0 5.08 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "LCSC" "{{AlPolylcsc}}"
		(at 0 5.08 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(pin "1"
		(uuid "efade859-dc80-47a7-85de-7ac6386f04e3")
	)
	(pin "2"
		(uuid "c6688ccf-e03a-4af3-bbb7-cdde4d13d772")
	)
	(instances
		(project "template"
			(path ""
				(reference "C16")
				(unit 1)
			)
		)
	)
)`;

export const FILTER_LABEL_TEMPLATE: string = `(lib_symbols
	(symbol "power:GND"
		(power)
		(pin_numbers
			(hide yes)
		)
		(pin_names
			(offset 0)
			(hide yes)
		)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(property "Reference" "#PWR"
			(at 0 -6.35 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Value" "GND"
			(at 0 -3.81 0)
			(effects
				(font (size 1.27 1.27))
			)
		)
		(property "Footprint" ""
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Datasheet" ""
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "Description" "Power symbol creates a global label with name \\\"GND\\\" , ground"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(property "ki_keywords" "global power"
			(at 0 0 0)
			(effects
				(font (size 1.27 1.27))
				(hide yes)
			)
		)
		(symbol "GND_0_1"
			(polyline
				(pts
					(xy 0 0) (xy 0 -1.27) (xy 1.27 -1.27) (xy 0 -2.54) (xy -1.27 -1.27) (xy 0 -1.27)
				)
				(stroke (width 0) (type default))
				(fill (type none))
			)
		)
		(symbol "GND_1_1"
			(pin power_in line
				(at 0 0 270)
				(length 0)
				(name "~"
					(effects
						(font (size 1.27 1.27))
					)
				)
				(number "1"
					(effects
						(font (size 1.27 1.27))
					)
				)
			)
		)
		(embedded_fonts no)
	)
)
(label "{{FILTER_LABEL}}"
	(at -12.7 0 0)
	(effects
		(font (size 1.27 1.27))
		(justify left bottom)
	)
	(uuid "14918a57-29b2-4193-8e77-be6e92ee6dcd")
)
(symbol
	(lib_id "power:GND")
	(at 0 10.16 0)
	(unit 1)
	(exclude_from_sim no)
	(in_bom yes)
	(on_board yes)
	(dnp no)
	(fields_autoplaced yes)
	(uuid "7a221f75-5dc1-4558-910e-9a1227a017b8")
	(property "Reference" "#PWR028"
		(at 0 16.51 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Value" "GND"
		(at 0 15.24 0)
		(effects
			(font (size 1.27 1.27))
		)
	)
	(property "Footprint" ""
		(at 0 10.16 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Datasheet" ""
		(at 0 10.16 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(property "Description" "Power symbol creates a global label with name \\\"GND\\\" , ground"
		(at 0 10.16 0)
		(effects
			(font (size 1.27 1.27))
			(hide yes)
		)
	)
	(pin "1"
		(uuid "62090e33-f790-4a09-886b-1426ff7a3a2f")
	)
	(instances
		(project "template"
			(path ""
				(reference "#PWR028")
				(unit 1)
			)
		)
	)
)`;
