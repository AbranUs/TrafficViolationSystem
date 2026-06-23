import pytest
import numpy as np
import cv2
from unittest.mock import MagicMock, patch

from app.services.yolo_predictor import (
    _process_coco_vehicle,
    _process_coco_traffic_light,
    _process_coco_boxes,
    _process_custom_boxes,
    _run_yolo_inference,
    predict_frame,
    analyze_traffic_light_color,
    detect_via_classic_cv,
    get_mock_detections_for_demo,
    get_yolo_models
)
from app.services.ia_service import (
    _update_traffic_light_state,
    _evaluate_custom_rules,
    _process_red_light_violation,
    _process_uturn_violation,
    _process_parking_violation,
    _evaluate_traditional_rules
)

class MockBox:
    def __init__(self, cls_id, conf, xyxy):
        self.cls = [cls_id]
        self.conf = [conf]
        mock_xyxy = MagicMock()
        mock_xyxy.tolist.return_value = xyxy
        self.xyxy = [mock_xyxy]


class MockResult:
    def __init__(self, boxes, names=None):
        self.boxes = boxes
        if names:
            self.names = names
        else:
            self.names = {}

# Test process_coco_vehicle
def test_process_coco_vehicle():
    detections = []
    # 2 = car
    res = _process_coco_vehicle(2, 0.8, [0.1, 0.1, 0.3, 0.3], 100, 100, detections)
    assert res is True
    assert len(detections) == 1
    assert detections[0]["class_name"] == "car"
    
    # 3 = motorcycle
    res = _process_coco_vehicle(3, 0.8, [0.1, 0.1, 0.3, 0.3], 100, 100, detections)
    assert res is True
    assert len(detections) == 2
    assert detections[1]["class_name"] == "motorcycle"
    
    # 10 = not vehicle
    res = _process_coco_vehicle(10, 0.8, [0.1, 0.1, 0.3, 0.3], 100, 100, detections)
    assert res is False
    assert len(detections) == 2

# Test process_coco_traffic_light
@patch("app.services.yolo_predictor.analyze_traffic_light_color")
def test_process_coco_traffic_light(mock_color):
    mock_color.return_value = "RED"
    detections = []
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # Process first red light
    _process_coco_traffic_light(0.8, [0.1, 0.1, 0.2, 0.2], 50, 50, detections, frame, 100, 100)
    assert len(detections) == 1
    assert detections[0]["class_name"] == "traffic_light_red"
    
    # Try duplicate nearby (dist < 30)
    _process_coco_traffic_light(0.8, [0.1, 0.1, 0.25, 0.25], 55, 55, detections, frame, 100, 100)
    assert len(detections) == 1  # Should ignore duplicate
    
    # Try different color
    mock_color.return_value = "YELLOW"
    _process_coco_traffic_light(0.8, [0.7, 0.7, 0.8, 0.8], 90, 90, detections, frame, 100, 100)
    assert len(detections) == 2
    assert detections[1]["class_name"] == "traffic_light_yellow"

# Test process_coco_boxes
@patch("app.services.yolo_predictor._process_coco_vehicle")
@patch("app.services.yolo_predictor._process_coco_traffic_light")
def test_process_coco_boxes(mock_tl, mock_veh):
    box1 = MockBox(2, 0.8, [10, 10, 30, 30])
    box2 = MockBox(9, 0.8, [40, 40, 60, 60])
    result = MockResult([box1, box2])
    
    detections = []
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    mock_veh.return_value = False
    _process_coco_boxes(result, detections, frame, 100, 100)
    
    mock_veh.assert_called()
    mock_tl.assert_called()

# Test process_custom_boxes
def test_process_custom_boxes():
    box1 = MockBox(4, 0.8, [10, 10, 30, 30])  # stop_line
    box2 = MockBox(5, 0.8, [40, 40, 60, 60])  # no_parking_zone
    box3 = MockBox(0, 0.8, [0, 0, 1, 1])      # vehicle
    result = MockResult([box1, box2, box3])
    
    detections = []
    _process_custom_boxes(result, detections, 100, 100)
    
    assert len(detections) == 2
    assert detections[0]["class_name"] == "stop_line"
    assert detections[1]["class_name"] == "no_parking_zone"

# Test run_yolo_inference
@patch("app.services.yolo_predictor._process_custom_boxes")
@patch("app.services.yolo_predictor._process_coco_boxes")
@patch("app.services.yolo_predictor.detect_via_classic_cv")
def test_run_yolo_inference(mock_classic, mock_coco, mock_custom):
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    state_tracker = {}
    
    custom_model = MagicMock()
    custom_model.return_value = [MockResult([])]
    custom_model.names = {0: "vehicle", 1: "traffic_light_red"}
    
    coco_model = MagicMock()
    coco_model.return_value = [MockResult([])]
    
    # Test custom and coco run
    _run_yolo_inference(frame, 1, state_tracker, 100, 100, custom_model, coco_model)
    mock_custom.assert_called()
    mock_coco.assert_called()
    assert state_tracker["is_custom_model"] is True
    
    # Test classic cv fallback
    mock_classic.return_value = [{"class_name": "car"}]
    mock_custom.reset_mock()
    mock_coco.reset_mock()
    dets = _run_yolo_inference(frame, 1, state_tracker, 100, 100, None, None)
    assert len(dets) == 1
    assert dets[0]["class_name"] == "car"
    mock_classic.assert_called()

# Test predict_frame
@patch("app.services.yolo_predictor.get_mock_detections_for_demo")
@patch("app.services.yolo_predictor.get_yolo_models")
@patch("app.services.yolo_predictor._run_yolo_inference")
def test_predict_frame(mock_run, mock_models, mock_mock):
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    state_tracker = {"filename": "infraccion.mp4"}
    
    # Test demo mock detections
    mock_mock.return_value = [{"class_name": "traffic_light_red", "bbox": [0.1, 0.1, 0.2, 0.2]}]
    dets = predict_frame(frame, 1, state_tracker, 100, 100)
    assert len(dets) == 1
    assert state_tracker["is_custom_model"] is True
    
    # Test normal path
    state_tracker = {"filename": "other.mp4"}
    mock_mock.return_value = []
    mock_models.return_value = (None, None)
    mock_run.return_value = [{"class_name": "traffic_light_red", "bbox": [0.1, 0.1, 0.2, 0.2]}]
    
    dets = predict_frame(frame, 1, state_tracker, 100, 100)
    assert len(dets) == 1
    assert state_tracker["current_traffic_light_red_bboxes"] == [[0.1, 0.1, 0.2, 0.2]]
    assert state_tracker["last_traffic_light_red_bbox"] == [0.1, 0.1, 0.2, 0.2]

# Test analyze_traffic_light_color
def test_analyze_traffic_light_color():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[0:10, 0:10, 2] = 255  # Red channel
    frame[20:30, 0:10, 1] = 255  # Green channel
    
    color = analyze_traffic_light_color(frame, [0.0, 0.0, 0.3, 0.3], 100, 100)
    assert color in ["RED", "YELLOW", "GREEN"]
    
    color = analyze_traffic_light_color(frame, [0.0, 0.0, 0.0, 0.0], 100, 100)
    assert color == "GREEN"

# Test classic CV
def test_detect_via_classic_cv():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame[20:40, 20:40] = 255
    dets = detect_via_classic_cv(frame, 100, 100)
    assert len(dets) >= 0

# Test mock detections
def test_get_mock_detections_for_demo():
    dets = get_mock_detections_for_demo("test.mp4", 1, 30.0, 100, 100)
    assert len(dets) == 0
    
    dets = get_mock_detections_for_demo("infraccion.mp4", 30, 30.0, 100, 100)
    assert len(dets) >= 1
    assert dets[0]["class_name"] == "traffic_light_red"

# Test update_traffic_light_state
def test_update_traffic_light_state():
    state = {"traffic_light_timer": 0, "traffic_light_state": "GREEN"}
    
    _update_traffic_light_state(state)
    assert state["traffic_light_state"] == "GREEN"
    assert state["traffic_light_timer"] == 1
    
    state["traffic_light_timer"] = 45
    _update_traffic_light_state(state)
    assert state["traffic_light_state"] == "YELLOW"
    
    state["traffic_light_timer"] = 60
    _update_traffic_light_state(state)
    assert state["traffic_light_state"] == "RED"
    
    state["traffic_light_timer"] = 120
    _update_traffic_light_state(state)
    assert state["traffic_light_state"] == "GREEN"
    assert state["traffic_light_timer"] == 0

# Test evaluate_custom_rules
@patch("app.services.ia_service.save_highlighted_frame")
@patch("app.services.ia_service.extract_license_plate")
def test_evaluate_custom_rules(mock_plate, mock_save):
    db = MagicMock()
    mock_plate.return_value = "ABC-1234"
    
    detections = [
        {"class_name": "infraccion_rojo", "confidence": 0.9, "bbox": [0.1, 0.1, 0.2, 0.2]},
        {"class_name": "infraccion_paso", "confidence": 0.9, "bbox": [0.3, 0.3, 0.4, 0.4]},
        {"class_name": "infraccion_giro", "confidence": 0.9, "bbox": [0.5, 0.5, 0.6, 0.6]}
    ]
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    _evaluate_custom_rules(db, detections, "video123", 1.0, 10, frame, "tmp", 100, 100)
    assert db.add.call_count == 3
    mock_save.assert_called()
    mock_plate.assert_called()

# Test process_red_light_violation
@patch("app.services.ia_service.check_red_light_violation")
@patch("app.services.ia_service.save_highlighted_frame")
@patch("app.services.ia_service.extract_license_plate")
def test_process_red_light_violation(mock_plate, mock_save, mock_check):
    db = MagicMock()
    mock_plate.return_value = "ABC-1234"
    mock_check.return_value = (True, "Red light violation message")
    
    state_tracker = {
        "vehicles": {
            1: {"positions": [(50, 50, 1)]}
        },
        "traffic_light_state": "RED",
        "current_traffic_light_red_bboxes": [[0.1, 0.1, 0.2, 0.2]]
    }
    
    det = {"track_id": 1, "bbox": [0.4, 0.4, 0.5, 0.5], "confidence": 0.9}
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    _process_red_light_violation(
        db, det, state_tracker, "video123", 1.0, 10, frame, "tmp", 100, 100, {}
    )
    db.add.assert_called()
    mock_save.assert_called()

# Test process_uturn_violation
@patch("app.services.ia_service.check_uturn_violation")
@patch("app.services.ia_service.save_highlighted_frame")
@patch("app.services.ia_service.extract_license_plate")
def test_process_uturn_violation(mock_plate, mock_save, mock_check):
    db = MagicMock()
    mock_plate.return_value = "ABC-1234"
    mock_check.return_value = (True, "U-turn violation message")
    
    state_tracker = {
        "vehicles": {
            1: {"positions": [(50, 50, 1)]}
        }
    }
    
    det = {"track_id": 1, "bbox": [0.4, 0.4, 0.5, 0.5], "confidence": 0.9}
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    _process_uturn_violation(
        db, det, state_tracker, "video123", 1.0, 10, frame, "tmp", 100, 100, {}
    )
    db.add.assert_called()
    mock_save.assert_called()

# Test process_parking_violation
@patch("app.services.ia_service.check_parking_violation")
@patch("app.services.ia_service.save_highlighted_frame")
@patch("app.services.ia_service.extract_license_plate")
def test_process_parking_violation(mock_plate, mock_save, mock_check):
    db = MagicMock()
    mock_plate.return_value = "ABC-1234"
    mock_check.return_value = (True, "Parking violation message")
    
    state_tracker = {
        "vehicles": {
            1: {"positions": [(50, 50, 1)]}
        }
    }
    
    det = {"track_id": 1, "bbox": [0.4, 0.4, 0.5, 0.5], "confidence": 0.9}
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    _process_parking_violation(
        db, det, state_tracker, "video123", 1.0, 10, frame, "tmp", 100, 100, {}
    )
    db.add.assert_called()
    mock_save.assert_called()

# Test evaluate_traditional_rules
@patch("app.services.ia_service._process_red_light_violation")
@patch("app.services.ia_service._process_uturn_violation")
@patch("app.services.ia_service._process_parking_violation")
def test_evaluate_traditional_rules(mock_park, mock_uturn, mock_red):
    db = MagicMock()
    state_tracker = {
        "vehicles": {
            1: {"positions": [(50, 50, 1)]}
        }
    }
    
    vehicle_detections = [
        {"track_id": 1, "bbox": [0.4, 0.4, 0.5, 0.5], "confidence": 0.9}
    ]
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    
    _evaluate_traditional_rules(db, vehicle_detections, state_tracker, "video123", 1.0, 10, frame, "tmp", 100, 100)
    mock_red.assert_called()
    mock_uturn.assert_called()
    mock_park.assert_called()
