document.addEventListener('DOMContentLoaded', () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const emojis = ['📚', '✏️', '🖊️', '📘', '📝', '📒', '📎'];

    function renderCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        days.forEach((day, i) => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            const h3 = document.createElement('h3');
            h3.textContent = day;
            dayDiv.appendChild(h3);

            const sticker = document.createElement('div');
            sticker.className = 'sticker';
            sticker.textContent = emojis[i % emojis.length];
            dayDiv.appendChild(sticker);

            const ul = document.createElement('ul');

            tasks.filter(t => getWeekday(t.date) === day && t.type === 'Task').forEach(t => {
                const li = document.createElement('li');
                li.classList.toggle('completed', t.completed);

                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = t.completed || false;
                checkbox.addEventListener('change', () => {
                    t.completed = checkbox.checked;
                    li.classList.toggle('completed', t.completed);
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    if (t.completed) showNotification(`Task "${t.name}" completed! ✅`);
                });
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(' ' + t.name));

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.textContent = 'Delete';
                removeBtn.onclick = () => {
                    const index = tasks.indexOf(t);
                    if (index > -1) tasks.splice(index, 1);
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    renderCalendar();
                }

                li.appendChild(label);
                li.appendChild(removeBtn);
                ul.appendChild(li);
            });

            dayDiv.appendChild(ul);
            calendar.appendChild(dayDiv);
        });
    }

    function renderAssignments() {
        const list = document.getElementById('assignments-list');
        list.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        const filtered = tasks.filter(t => t.type === 'Assignment' || t.type === 'Quiz');

        filtered.forEach(t => {
            const li = document.createElement('li');
            li.classList.add(t.type.toLowerCase());
            li.classList.toggle('completed', t.completed);

            const typeHeading = document.createElement('div');
            typeHeading.className = 'assignment-type';
            typeHeading.textContent = t.type;

            const details = document.createElement('div');
            details.className = 'assignment-details';

            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = t.completed;
            checkbox.addEventListener('change', () => {
                t.completed = checkbox.checked;
                li.classList.toggle('completed', t.completed);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                if (t.completed) showNotification(`${t.type} "${t.name}" completed! ✅`);
                renderCalendar();
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + t.name + ' - Due: ' + t.date));

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Delete';
            removeBtn.onclick = () => {
                const index = tasks.indexOf(t);
                if (index > -1) tasks.splice(index, 1);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderAssignments();
                renderCalendar();
            }

            details.appendChild(label);
            details.appendChild(removeBtn);

            li.appendChild(typeHeading);
            li.appendChild(details);
            list.appendChild(li);
        });
    }

    function getWeekday(dateStr) {
        const date = new Date(dateStr);
        return days[date.getDay() === 0 ? 6 : date.getDay() - 1];
    }

    const taskInput = document.getElementById('new-task');
    const taskDateInput = document.getElementById('task-date');
    const addTaskBtn = document.getElementById('add-task');

    addTaskBtn.onclick = () => {
        const name = taskInput.value.trim();
        const date = taskDateInput.value;
        const type = document.getElementById('task-type').value;

        if (!name || !date) return alert("Please enter task and date");

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ name, date, type, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));

        taskInput.value = '';
        taskDateInput.value = '';
        document.getElementById('task-type').value = 'Task';

        renderCalendar();
        renderAssignments();
    };

    function showNotification(msg) {
        const notif = document.createElement('div');
        notif.textContent = msg;
        notif.style.position = 'fixed';
        notif.style.top = '20px';
        notif.style.right = '20px';
        notif.style.background = '#27ae60';
        notif.style.color = 'white';
        notif.style.padding = '12px 20px';
        notif.style.borderRadius = '8px';
        notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        notif.style.zIndex = 9999;
        notif.style.fontWeight = 'bold';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    renderCalendar();
    renderAssignments();

    // Timer
    let timerInterval = null;
    let elapsedSeconds = 0;
    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('start-timer');
    const stopBtn = document.getElementById('stop-timer');
    const resetBtn = document.getElementById('reset-timer');

    function updateTimer() {
        elapsedSeconds++;
        const hrs = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${hrs}:${mins}:${secs}`;
    }

    startBtn.onclick = () => {
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);
            startBtn.disabled = true;
            stopBtn.disabled = false;
            resetBtn.disabled = false;
        }
    }
    stopBtn.onclick = () => {
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
    resetBtn.onclick = () => {
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedSeconds = 0;
        timerDisplay.textContent = '00:00:00';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = true;
    }

    // Quotes
    const quotes = [
        "You don’t have to be perfect, you just have to be consistent.",
        "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
        "There are no shortcuts to any place worth going. – Beverly Sills",
        "Don’t wait for the perfect moment. Take the moment and make it perfect. – Zoey Sayward",
        "Wake up with determination. Go to bed with satisfaction."
    ];
    const quoteElem = document.getElementById('motivational-quote');
    const newQuoteBtn = document.getElementById('new-quote');
    function displayRandomQuote() {
        const index = Math.floor(Math.random() * quotes.length);
        quoteElem.textContent = quotes[index];
    }
    newQuoteBtn.onclick = displayRandomQuote;
    displayRandomQuote();

});