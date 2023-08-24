import React, { useEffect, useState, useRef } from "react";

const Alarm = ({ alarmStatus, alarmLv1, alarmLv2, handleAlarm }) => {
  return (
    <div>
      {!alarmStatus ? (
        <button class="alarm_button" onClick={handleAlarm}>
          <b>Set Alarm</b>
        </button>
      ) : (
        <button class="alarm_button_2" onClick={handleAlarm}>
          <b>Turn Alarm Off</b>
        </button>
      )}
      {alarmStatus == 1 && (
        <div>
          <b className="alarm_status-container ">Alarm Status:</b>

          <div>Inner Alarm:</div>
          <div style={{ color: "red" }}>{alarmLv1 ? "True" : "False"}</div>

          <div>Outer Alarm:</div>
          <div style={{ color: "red" }}>{alarmLv2 ? "True" : "False"}</div>
        </div>
      )}
    </div>
  );
};
export default Alarm;
