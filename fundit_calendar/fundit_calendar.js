let currentDate = new Date();
let currentYear = 2025;
let currentMonth = 2;
let currentDay = currentDate.getDate();

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

let events = {};
let policyPeriods = {};

function generatePolicyPeriodsFromHTML() {
    const policyBoxes = document.querySelectorAll('.policy-box');
    policyBoxes.forEach(box => {
        const policyId = box.dataset.policyId;
        const type = box.dataset.type;
        const month = parseInt(box.dataset.month) - 1;
        const start = parseInt(box.dataset.start);
        const end = parseInt(box.dataset.end);

        policyPeriods[policyId] = {
            start: start,
            end: end,
            type: type
        };

        for (let i = start; i <= end; i++) {
            // dateKey 생성 시 템플릿 리터럴 사용
            const dateKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            events[dateKey] = {
                type,
                name: policyId
            };
        }
    });
}

function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById("calendarDays");
    calendarDays.innerHTML = "";

    weekdayNames.forEach(weekday => {
        const day = document.createElement("div");
        day.className = "calendar-weekday";
        day.textContent = weekday;
        calendarDays.appendChild(day);
    });

    let dayCounter = 1 - firstDay;
    const totalDays = (new Date(year, month + 1, 7).getDay() === 6 ? 42 : 35 + new Date(year, month + 1, 7).getDay());

    for (let i = 0; i < totalDays; i++) {
        const day = document.createElement("div");
        day.className = "calendar-day";

        if (dayCounter > 0 && dayCounter <= daysInMonth) {
            day.textContent = dayCounter;

            // dateKey 생성 시 템플릿 리터럴 사용
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
            if (events[dateKey]) {
                day.addEventListener('click', () => {
                    const eventType = events[dateKey].type;
                    if (day.classList.contains(`policy-${eventType}`)) {
                        day.classList.remove(`policy-${eventType}`);
                    } else {
                        day.classList.add(`policy-${eventType}`);
                    }
                });
            }

            if (dayCounter === currentDay && year === new Date().getFullYear() && month === new Date().getMonth()) {
                day.classList.add("today");
            }
        } else {
            day.classList.add("inactive");
            if (dayCounter <= 0) {
                day.textContent = prevMonthDays + dayCounter;
            } else {
                day.textContent = dayCounter - daysInMonth;
            }
        }

        calendarDays.appendChild(day);
        dayCounter++;
    }

    document.getElementById("currentMonthYear").textContent = monthNames[month] + " " + year;
}
// 월 이전으로 이동
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentYear, currentMonth);
}

// 월 다음으로 이동
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentYear, currentMonth);
}

// HTML 데이터 기반으로 정책 기간 생성 후 달력 생성
generatePolicyPeriodsFromHTML();
generateCalendar(currentYear, currentMonth);

// 정책 데이터 가져오는 함수 (예시)
async function getPolicyData() {
    try {
        return [{
                id: "청년내일채움공제",
                name: "청년내일채움공제",
                type: "여유있는 정책",
                status: "relaxed"
            },
            {
                id: "청년희망적금",
                name: "청년희망적금",
                type: "마감 임박 정책 확인",
                status: "urgent"
            },
            {
                id: "청년주택드림",
                name: "청년주택드림",
                type: "마감 임박 정책 확인",
                status: "urgent"
            },
            {
                id: "청년도약계좌",
                name: "청년도약계좌",
                type: "여유있는 정책",
                status: "relaxed"
            },
        ];
    } catch (error) {
        console.error("정책 데이터를 가져오는 중 오류가 발생했습니다:", error);
        return [];
    }
}

let policyStatus;

// 페이지 로드 시 정책 상자 정렬
window.addEventListener('DOMContentLoaded', () => {
    sortPolicyBoxes();

    const policyBoxes = document.querySelectorAll('.policy-box');
    policyBoxes.forEach(box => {
        box.addEventListener('mouseenter', () => highlightPolicyPeriod(box.dataset.policyId, true));
        box.addEventListener('mouseleave', () => highlightPolicyPeriod(box.dataset.policyId, false));
    });
});

function sortPolicyBoxes() {
    const policyContainer = document.querySelector(".policy-box-container");
    const policyBoxes = Array.from(document.querySelectorAll(".policy-box"));

    policyBoxes.sort((a, b) => {
        const typeA = a.dataset.type;
        const typeB = b.dataset.type;

        if (typeA === "여유있는 정책" && typeB !== "여유있는 정책") {
            return -1;
        }
        if (typeA !== "여유있는 정책" && typeB === "여유있는 정책") {
            return 1;
        }

        if (typeA === "마감 임박 정책 확인" && typeB !== "마감 임박 정책 확인") {
            return -1;
        }
        if (typeA !== "마감 임박 정책 확인" && typeB === "마감 임박 정책 확인") {
            return 1;
        }

        if (typeA === "종료된 정책" && typeB !== "종료된 정책") {
            return 1;
        }
        if (typeA !== "종료된 정책" && typeB === "종료된 정책") {
            return -1;
        }

        return 0;
    });

    policyBoxes.forEach(box => policyContainer.appendChild(box));
}

function highlightPolicyPeriod(policyId, highlight) {
    const period = policyPeriods[policyId];
    if (!period) return;

    const calendarDays = document.getElementById("calendarDays");
    const days = calendarDays.children;

    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (day.classList.contains("calendar-day") && !day.classList.contains("inactive")) {
            const dayNumber = parseInt(day.textContent);
            if (dayNumber >= period.start && dayNumber <= period.end) {
                if (highlight) {
                    day.classList.add(`policy-${period.type}`);
                } else {
                    day.classList.remove(`policy-${period.type}`);
                }
            }
        }
    }
}

