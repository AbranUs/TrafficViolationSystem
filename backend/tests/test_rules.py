# backend/tests/test_rules.py
import pytest
import re
from app.services.rules import (
    generate_mock_license_plate,
    check_red_light_violation,
    check_uturn_violation,
    check_parking_violation,
    STOP_LINE_COEFF,
    STATIONARY_PIXELS_THRESHOLD,
    PARKING_FRAMES_THRESHOLD
)

def test_generate_mock_license_plate():
    plate = generate_mock_license_plate()
    assert isinstance(plate, str)
    # Match standard format ABC-1234
    assert re.match(r"^[A-Z]{3}-\d{4}$", plate)

def test_check_red_light_violation_insufficient_positions():
    track = {"crossed_stop_line": False, "red_light_triggered": False}
    # Fewer than 2 positions should not trigger any violation
    violation, msg = check_red_light_violation([(100, 100, 1)], 1000, "RED", track)
    assert not violation
    assert msg == ""

def test_check_red_light_violation_green_light():
    track = {"crossed_stop_line": False, "red_light_triggered": False}
    height = 1000
    stop_line_y = int(STOP_LINE_COEFF * height)
    
    # Coordinates crossing the stop line vertically downwards (e.g. from above stop line to below)
    positions = [
        (100, stop_line_y - 10, 1),
        (100, stop_line_y + 10, 2)
    ]
    
    # With a GREEN light, it shouldn't trigger a violation, but should mark it as crossed
    violation, msg = check_red_light_violation(positions, height, "GREEN", track)
    assert not violation
    assert msg == ""
    assert track["crossed_stop_line"] is True

def test_check_red_light_violation_red_light():
    track = {"crossed_stop_line": False, "red_light_triggered": False}
    height = 1000
    stop_line_y = int(STOP_LINE_COEFF * height)
    
    positions = [
        (100, stop_line_y - 10, 1),
        (100, stop_line_y + 10, 2)
    ]
    
    violation, msg = check_red_light_violation(positions, height, "RED", track)
    assert violation
    assert "omitió la línea de parada" in msg
    assert track["crossed_stop_line"] is True
    assert track["red_light_triggered"] is True

def test_check_red_light_violation_no_crossing():
    track = {"crossed_stop_line": False, "red_light_triggered": False}
    height = 1000
    stop_line_y = int(STOP_LINE_COEFF * height)
    
    # Stays above the stop line
    positions = [
        (100, stop_line_y - 30, 1),
        (100, stop_line_y - 10, 2)
    ]
    
    violation, msg = check_red_light_violation(positions, height, "RED", track)
    assert not violation
    assert msg == ""
    assert track["crossed_stop_line"] is False

def test_check_uturn_violation_insufficient_positions():
    track = {"uturn_triggered": False}
    # Needs at least 15 positions
    positions = [(100, 200 - i, i) for i in range(10)]
    violation, msg = check_uturn_violation(positions, 1000, track)
    assert not violation
    assert msg == ""

def test_check_uturn_violation_already_triggered():
    track = {"uturn_triggered": True}
    positions = [(100, 200, i) for i in range(20)]
    violation, msg = check_uturn_violation(positions, 1000, track)
    assert not violation

def test_check_uturn_violation_success():
    track = {"uturn_triggered": False}
    height = 1000
    # Create a parabolic movement path in Y: goes down, peaks, and goes back up
    # In pixels, from 300 to 500 (peak) and back up to 300
    positions = []
    # Going down
    for i in range(10):
        positions.append((100, 300 + i * 20, i)) # peaks at 300 + 180 = 480
    # Peaking and going up
    for i in range(10):
        positions.append((100, 480 - i * 20, 10 + i)) # ends at 480 - 180 = 300
        
    violation, msg = check_uturn_violation(positions, height, track)
    assert violation
    assert "cambio drástico de trayectoria" in msg
    assert track["uturn_triggered"] is True

def test_check_parking_violation_outside_zone():
    track = {"stationary_frames": 0, "parking_triggered": False}
    det = {"cx": 10, "cy": 10} # way outside the 5% - 45% x, 50% - 95% y zone
    positions = [(10, 10, 1), (10, 10, 2)]
    
    violation, msg = check_parking_violation(det, positions, 1000, 1000, track)
    assert not violation
    assert msg == ""

def test_check_parking_violation_moving_inside_zone():
    track = {"stationary_frames": 0, "parking_triggered": False}
    # restricted zone in pixels for 1000x1000 screen:
    # x: 50 to 450, y: 500 to 950
    det = {"cx": 100, "cy": 600}
    
    # Vehicle is moving fast (displacement is 20 pixels, which is > STATIONARY_PIXELS_THRESHOLD)
    positions = [
        (100, 580, 1),
        (100, 600, 2)
    ]
    
    violation, msg = check_parking_violation(det, positions, 1000, 1000, track)
    assert not violation
    assert track["stationary_frames"] == 0

def test_check_parking_violation_stationary_trigger():
    track = {"stationary_frames": PARKING_FRAMES_THRESHOLD - 1, "parking_triggered": False}
    det = {"cx": 100, "cy": 600}
    
    # Very small displacement (2 pixels, which is < STATIONARY_PIXELS_THRESHOLD)
    positions = [
        (100, 598, 1),
        (100, 600, 2)
    ]
    
    violation, msg = check_parking_violation(det, positions, 1000, 1000, track)
    assert violation
    assert "Permaneció inmóvil" in msg
    assert track["parking_triggered"] is True
    assert track["stationary_frames"] == PARKING_FRAMES_THRESHOLD
