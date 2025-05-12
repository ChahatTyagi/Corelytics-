
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const profileBtn = document.getElementById('profile-btn');
const logoutBtn = document.getElementById('logout-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const dashboardLink = document.querySelector('.dashboard-link');

const registerModal = document.getElementById('register-modal');
const loginModal = document.getElementById('login-modal');
const profileModal = document.getElementById('profile-modal');

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const profileForm = document.getElementById('profile-form');
const progressForm = document.getElementById('progress-form');
const deleteProfileBtn = document.getElementById('delete-profile-btn');

const dashboardSection = document.getElementById('dashboard');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');



const closeButtons = document.querySelectorAll('.close');



let currentUser = null;
let progressList = [];


const API_BASE_URL = 'http://localhost:3000/api';


const scrollToTopBtn = document.getElementById('scroll-to-top');


function init() {
   
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        updateUIForLoggedInUser();
        
     
        fetchUserProgress();
    }
    
    setupEventListeners();
    setActiveLink();
    
   
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
   
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


function setupEventListeners() {
   
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    getStartedBtn.addEventListener('click', () => openModal(registerModal));
    profileBtn.addEventListener('click', () => {
        fillProfileForm();
        openModal(profileModal);
    });
    logoutBtn.addEventListener('click', logoutUser);
    
   
    registerForm.addEventListener('submit', registerUser);
    loginForm.addEventListener('submit', loginUser);
    profileForm.addEventListener('submit', updateProfile);
    progressForm && progressForm.addEventListener('submit', saveProgress);
    deleteProfileBtn.addEventListener('click', deleteProfile);
    
   
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            closeModal(document.getElementById(modalId));
        });
    });
    
   
    window.addEventListener('click', (e) => {
        if (e.target === registerModal) closeModal(registerModal);
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === profileModal) closeModal(profileModal);
    });
    
  
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            openTab(tabName);
        });
    });
    

   
    document.addEventListener('scroll', setActiveLink);
}


function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}


function openTab(tabName) {
   
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}



async function registerUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    const weeklySteps = document.getElementById('weekly-steps').value;
    const heartRate = document.getElementById('heart-rate-input').value;
    const bloodPressure = document.getElementById('blood-pressure-input').value;
    const vegetarian = document.getElementById('vegetarian').checked;
    const fitnessGoal = document.getElementById('fitness-goal').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                name,
                age,
                gender,
                height,
                weight,
                weeklySteps,
                heartRate,
                bloodPressure,
                vegetarian,
                fitnessGoal
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
      
        currentUser = {
            id: data.userId,
            username,
            name,
            age,
            gender,
            height,
            weight,
            weeklySteps,
            heartRate,
            bloodPressure,
            vegetarian,
            fitnessGoal
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        closeModal(registerModal);
        updateUIForLoggedInUser();
        showNotification('Registration successful!', 'success');
        
     
        registerForm.reset();
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed', 'error');
    }
}

async function loginUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        closeModal(loginModal);
        updateUIForLoggedInUser();
        showNotification('Login successful!', 'success');
      

        loginForm.reset();
        
        fetchUserProgress();
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
    }
}

function logoutUser() {
   
    currentUser = null;
    localStorage.removeItem('currentUser');
      
    updateUIForLoggedOutUser();
    
    alert('Logged out successfully!');
}

async function updateProfile(e) {
    e.preventDefault();
    
    const name = document.getElementById('update-name').value;
    const age = document.getElementById('update-age').value;
    const gender = document.getElementById('update-gender').value;
    const password = document.getElementById('update-password').value;
    const height = document.getElementById('update-height').value;
    const weight = document.getElementById('update-weight').value;
    const fitnessGoal = document.getElementById('update-fitness-goal').value;
    
    try {
        const updateData = {
            name,
            age,
            gender,
            height,
            weight,
            fitnessGoal
        };
        
        
        if (password) {
            updateData.password = password;
        }
        
        const response = await fetch(`${API_BASE_URL}/profile/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Profile update failed');
        }
        
       
        currentUser = {
            ...currentUser,
            name,
            age,
            gender,
            height,
            weight,
            fitnessGoal
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        closeModal(profileModal);
        updateUIForLoggedInUser();
        showNotification('Profile updated successfully!', 'success');
        
      
        profileForm.reset();
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification(error.message || 'Profile update failed', 'error');
    }
}

async function deleteProfile() {
    if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/${currentUser.id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Profile deletion failed');
            }
            
            
            localStorage.removeItem('currentUser');
            currentUser = null;
            
            closeModal(profileModal);
            updateUIForLoggedOutUser();
            showNotification('Profile deleted successfully', 'success');
        } catch (error) {
            console.error('Profile deletion error:', error);
            showNotification(error.message || 'Profile deletion failed', 'error');
        }
    }
}

function fillProfileForm() {
    if (!currentUser) return;
    
    document.getElementById('update-name').value = currentUser.name;
    document.getElementById('update-age').value = currentUser.age;
    document.getElementById('update-gender').value = currentUser.gender;
    document.getElementById('update-password').value = currentUser.password;
    document.getElementById('update-height').value = currentUser.height;
    document.getElementById('update-weight').value = currentUser.weight;
    document.getElementById('update-fitness-goal').value = currentUser.fitnessGoal || '';
}


function updateUIForLoggedInUser() {
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    profileBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    dashboardLink.classList.remove('hidden');
    dashboardSection.classList.remove('hidden');
}

function updateUIForLoggedOutUser() {
   
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    profileBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    dashboardLink.classList.add('hidden');
    dashboardSection.classList.add('hidden');
}


async function fetchUserProgress() {
    try {
        const response = await fetch(`${API_BASE_URL}/progress/${currentUser.id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch progress data');
        }
        const data = await response.json();
        progressList = data.progress;
        updateProgressHistory();
        createProgressChart();
    } catch (error) {
        console.error('Error fetching progress:', error);
        showNotification('Failed to load progress data', 'error');
    }
}

async function saveProgress(e) {
    e.preventDefault();
    
    const date = document.getElementById('progress-date').value;
    const weight = document.getElementById('progress-weight').value;
    const height = document.getElementById('progress-height').value;
    const steps = document.getElementById('progress-steps').value;
    const heartRate = document.getElementById('progress-heart-rate').value;
    const bloodPressure = document.getElementById('progress-blood-pressure').value;
    const calories = document.getElementById('progress-calories').value;
    const dietFollowed = document.getElementById('progress-diet-followed').checked;
    const exerciseDone = document.getElementById('progress-exercise-done').checked;
    
    try {
        const response = await fetch(`${API_BASE_URL}/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                date,
                weight,
                height,
                steps,
                heartRate,
                bloodPressure,
                calories,
                dietFollowed,
                exerciseDone
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to save progress');
        }
        
        
        const newProgress = {
            id: data.progressId,
            date,
            weight,
            height,
            steps,
            heartRate,
            bloodPressure,
            calories,
            dietFollowed,
            exerciseDone
        };
        
        progressList.unshift(newProgress);
        updateProgressHistory();
        createProgressChart();
        progressForm.reset();
        
        showNotification('Progress saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving progress:', error);
        showNotification(error.message || 'Failed to save progress', 'error');
    }
}

function generateStatistics() {
    if (!currentUser) return;
    
    const activityLevels = {
        'sedentary': { stepsFactor: 0.6, caloriesFactor: 0.7, activeFactor: 0.5 },
        'light': { stepsFactor: 0.8, caloriesFactor: 0.9, activeFactor: 0.8 },
        'moderate': { stepsFactor: 1, caloriesFactor: 1, activeFactor: 1 },
        'active': { stepsFactor: 1.2, caloriesFactor: 1.2, activeFactor: 1.3 },
        'extreme': { stepsFactor: 1.4, caloriesFactor: 1.5, activeFactor: 1.5 }
    };
    
    const goalFactors = {
        'Lose Weight': { stepsFactor: 1.2, caloriesFactor: 1.3, activeFactor: 1.2 },
        'Moderate Weight': { stepsFactor: 1, caloriesFactor: 1, activeFactor: 1 },
        'Gain Weight': { stepsFactor: 0.8, caloriesFactor: 0.9, activeFactor: 0.9 }
    };

    let activityLevel = 'moderate';
    if (currentUser.weeklySteps < 35000) {
        activityLevel = 'sedentary';
    } else if (currentUser.weeklySteps < 70000) {
        activityLevel = 'light';
    } else if (currentUser.weeklySteps < 100000) {
        activityLevel = 'moderate';
    } else if (currentUser.weeklySteps < 150000) {
        activityLevel = 'active';
    } else {
        activityLevel = 'extreme';
    }
    
    
    const activityFactor = activityLevels[activityLevel] || activityLevels.moderate;
    const goalFactor = goalFactors[currentUser.fitnessGoal] || goalFactors['Moderate Weight'];
    
    
    const baseSteps = 8000;
    const baseCalories = 400;
    const baseActive = 45;
    
    
    currentUser.stats.steps = Math.round(baseSteps * activityFactor.stepsFactor * goalFactor.stepsFactor);
    currentUser.stats.calories = Math.round(baseCalories * activityFactor.caloriesFactor * goalFactor.caloriesFactor);
    currentUser.stats.active = Math.round(baseActive * activityFactor.activeFactor * goalFactor.activeFactor);
    
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}


function updateDashboard() {
    if (!currentUser) return;
    
    
    updateUserInfo();
    
    
    document.getElementById('steps-count').textContent = currentUser.stats.steps.toLocaleString();
    document.getElementById('calories-count').textContent = currentUser.stats.calories.toLocaleString();
    document.getElementById('active-count').textContent = currentUser.stats.active.toLocaleString();
    
    
    document.getElementById('heart-rate').textContent = `${currentUser.heartRate} bpm`;
    document.getElementById('blood-pressure').textContent = currentUser.bloodPressure;
    
    
    const stepsGoal = parseInt(document.getElementById('steps-goal').textContent.replace(',', ''));
    const caloriesGoal = parseInt(document.getElementById('calories-goal').textContent);
    const activeGoal = parseInt(document.getElementById('active-goal').textContent);
    
    const stepsProgress = Math.min(100, (currentUser.stats.steps / stepsGoal) * 100);
    const caloriesProgress = Math.min(100, (currentUser.stats.calories / caloriesGoal) * 100);
    const activeProgress = Math.min(100, (currentUser.stats.active / activeGoal) * 100);
    
    document.getElementById('steps-progress').style.width = `${stepsProgress}%`;
    document.getElementById('calories-progress').style.width = `${caloriesProgress}%`;
    document.getElementById('active-progress').style.width = `${activeProgress}%`;
    
    
    updateProgressHistory();
    
    
    updateDietPlan();
    
    
    updateExercisePlan();
    
    
    createProgressChart();
}

function updateUserInfo() {
    const userInfoElement = document.getElementById('user-info');
    userInfoElement.innerHTML = `
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Age:</strong> ${currentUser.age}</p>
        <p><strong>Gender:</strong> ${currentUser.gender}</p>
        <p><strong>Height:</strong> ${currentUser.height} ft</p>
        <p><strong>Weight:</strong> ${currentUser.weight} kg</p>
        <p><strong>Weekly Steps:</strong> ${currentUser.weeklySteps.toLocaleString()}</p>
        <p><strong>Heart Rate:</strong> ${currentUser.heartRate} bpm</p>
        <p><strong>Blood Pressure:</strong> ${currentUser.bloodPressure}</p>
        <p><strong>Vegetarian:</strong> ${currentUser.vegetarian ? 'Yes' : 'No'}</p>
        <p><strong>Fitness Goal:</strong> ${currentUser.fitnessGoal || 'Not set'}</p>
    `;
}

function updateProgressHistory() {
    const progressListElement = document.getElementById('progress-list');
    
    if (!progressListElement) return;
    
    if (progressList.length === 0) {
        progressListElement.innerHTML = '<p>No progress recorded yet.</p>';
        return;
    }
    
    let htmlContent = '';
    
    const sortedProgress = [...progressList].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedProgress.forEach(progress => {
        const date = new Date(progress.date).toLocaleDateString();
        htmlContent += `
            <div class="progress-item">
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Weight:</strong> ${progress.weight} kg</p>
                <p><strong>Height:</strong> ${progress.height} ft</p>
                <p><strong>Steps:</strong> ${progress.steps.toLocaleString()}</p>
                <p><strong>Heart Rate:</strong> ${progress.heartRate} bpm</p>
                <p><strong>Blood Pressure:</strong> ${progress.bloodPressure}</p>
                <p><strong>Calories Intake:</strong> ${progress.calories}</p>
                <p><strong>Diet Plan Followed:</strong> ${progress.dietFollowed ? 'Yes' : 'No'}</p>
                <p><strong>Exercise Completed:</strong> ${progress.exerciseDone ? 'Yes' : 'No'}</p>
            </div>
        `;
    });
    
    progressListElement.innerHTML = htmlContent;
}

function updateDietPlan() {
    const dietPlanElement = document.getElementById('diet-plan');
    
    if (!dietPlanElement) return;
    
    if (!currentUser || !currentUser.fitnessGoal) {
        dietPlanElement.textContent = 'Please set your fitness goal to view your diet plan.';
        return;
    }
    
    const plan = getDietPlanBasedOnGoal();
    dietPlanElement.textContent = plan;
}

function updateExercisePlan() {
    const exercisePlanElement = document.getElementById('exercise-plan');
    
    if (!exercisePlanElement) return;
    
    if (!currentUser || !currentUser.fitnessGoal) {
        exercisePlanElement.textContent = 'Please set your fitness goal to view your exercise plan.';
        return;
    }
    
    const plan = getExercisePlanBasedOnGoal();
    exercisePlanElement.textContent = plan;
}

function getDietPlanBasedOnGoal() {
    if (!currentUser) return '';
    
    let plan = '';
    
    if (currentUser.fitnessGoal === 'Gain Weight') {
        if (currentUser.vegetarian) {
            plan = "Diet Plan for Gaining Weight (Vegetarian):\n" +
                "Monday: Oatmeal with fruits and nuts\n" +
                "Tuesday: Whole-grain toast with avocado and eggs\n" +
                "Wednesday: Quinoa salad with chickpeas and vegetables\n" +
                "Thursday: Lentil soup with whole-grain bread \n" +
                "Friday: Grilled tofu with roasted vegetables and brown rice\n" +
                "Saturday: Smoothie bowl with banana, spinach, and almond milk\n" +
                "Sunday: Vegetable stir-fry with tofu and brown rice\n";
        } else {
            plan = "Diet Plan for Gaining Weight:\n" +
                "Monday: Oatmeal with fruits and nuts\n" +
                "Tuesday: Whole-grain toast with avocado and eggs\n" +
                "Wednesday: Chicken stir-fry with vegetables and brown rice\n" +
                "Thursday: Grilled salmon with quinoa and steamed vegetables\n" +
                "Friday: Beef stir-fry with vegetables and brown rice\n" +
                "Saturday: Smoothie bowl with banana, spinach, and almond milk\n" +
                "Sunday: Grilled chicken with roasted vegetables and sweet potatoes\n";
        }
    } else if (currentUser.fitnessGoal === 'Moderate Weight') {
        if (currentUser.vegetarian) {
            plan = "Diet Plan for Maintaining Weight (Vegetarian):\n" +
                "Monday: Oatmeal with fruits and nuts\n" +
                "Tuesday: Whole-grain toast with avocado and eggs\n" +
                "Wednesday: Quinoa salad with chickpeas and vegetables\n" +
                "Thursday: Lentil soup with whole-grain bread \n" +
                "Friday: Grilled tofu with roasted vegetables and brown rice\n" +
                "Saturday: Smoothie bowl with banana, spinach, and almond milk\n" +
                "Sunday: Vegetable stir-fry with tofu and brown rice\n";
        } else {
            plan = "Diet Plan for Maintaining Weight:\n" +
                "Monday: Oatmeal with fruits and nuts\n" +
                "Tuesday: Whole-grain toast with avocado and eggs\n" +
                "Wednesday: Chicken stir-fry with vegetables and brown rice\n" +
                "Thursday: Grilled salmon with quinoa and steamed vegetables\n" +
                "Friday: Beef stir-fry with vegetables and brown rice\n" +
                "Saturday: Smoothie bowl with banana, spinach, and almond milk\n" +
                "Sunday: Grilled chicken with roasted vegetables and sweet potatoes\n";
        }
    } else if (currentUser.fitnessGoal === 'Lose Weight') {
        if (currentUser.vegetarian) {
            plan = "Diet Plan for Losing Weight (Vegetarian):\n" +
                "Monday: Oatmeal with fruits and nuts\n" +
                "Tuesday: Whole-grain toast with avocado and eggs\n" +
                "Wednesday: Quinoa salad with chickpeas and vegetables\n" +
                "Thursday: Lentil soup with whole-grain bread \n" +
                "Friday: Grilled tofu with roasted vegetables and brown rice\n" +
                "Saturday: Smoothie bowl with banana, spinach, and almond milk\n" +
                "Sunday: Vegetable stir-fry with tofu and brown rice\n";
        } else {
            plan = "Diet Plan for Losing Weight:\n" +
                "Monday: Oatmeal with fruits and nuts\n" +
                "Tuesday: Whole-grain toast with avocado and eggs\n" +
                "Wednesday: Chicken stir-fry with vegetables and brown rice\n" +
                "Thursday: Grilled salmon with quinoa and steamed vegetables\n" +
                "Friday: Beef stir-fry with vegetables and brown rice\n" +
                "Saturday: Smoothie bowl with banana, spinach, and almond milk\n" +
                "Sunday: Grilled chicken with roasted vegetables and sweet potatoes\n";
        }
    }
    
    return plan;
}

function getExercisePlanBasedOnGoal() {
    if (!currentUser) return '';
    
    let plan = '';
    
    if (currentUser.fitnessGoal === 'Gain Weight') {
        plan = "Exercise Plan for Gaining Weight:\n" +
            "Monday: Strength training (legs and core)\n" +
            "Tuesday: Cardio (30 minutes of moderate-intensity exercise)\n" +
            "Wednesday: Strength training (upper body)\n" +
            "Thursday: Rest day\n" +
            "Friday: Strength training (full body)\n" +
            "Saturday: Cardio (30 minutes of high-intensity exercise)\n" +
            "Sunday: Rest day\n";
    } else if (currentUser.fitnessGoal === 'Moderate Weight') {
        plan = "Exercise Plan for Maintaining Weight:\n" +
            "Monday: Cardio (30 minutes of moderate-intensity exercise)\n" +
            "Tuesday: Strength training (upper body)\n" +
            "Wednesday: Cardio (30 minutes of high-intensity exercise)\n" +
            "Thursday: Rest day\n" +
            "Friday: Strength training (full body)\n" +
            "Saturday: Cardio (30 minutes of moderate-intensity exercise)\n" +
            "Sunday: Rest day\n";
    } else if (currentUser.fitnessGoal === 'Lose Weight') {
        plan = "Exercise Plan for Losing Weight:\n" +
            "Monday: Cardio (30 minutes of high-intensity exercise)\n" +
            "Tuesday: Strength training (upper body)\n" +
            "Wednesday: Cardio (30 minutes of moderate-intensity exercise)\n" +
            "Thursday: Rest day\n" +
            "Friday: Strength training (full body)\n" +
            "Saturday: Cardio (30 minutes of high-intensity exercise)\n" +
            "Sunday: Rest day\n";
    }
    
    return plan;
}

function createProgressChart() {
    const ctx = document.getElementById('progress-chart');
    
    if (!ctx) return;
    
    // Prepare data for chart
    const dates = [];
    const weights = [];
    const steps = [];
    
    // Get last 7 records or fewer if not enough
    const recordsToShow = progressList.slice(-7);
    
    // Sort by date
    recordsToShow.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    recordsToShow.forEach(progress => {
        dates.push(new Date(progress.date).toLocaleDateString());
        weights.push(progress.weight);
        steps.push(progress.steps / 100); // Scale down steps for better visualization
    });
    
    // Destroy existing chart if it exists
    if (window.progressChart) {
        window.progressChart.destroy();
    }
    
    // Create new chart
    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.length > 0 ? dates : ['No data'],
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: weights.length > 0 ? weights : [0],
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Steps (×100)',
                    data: steps.length > 0 ? steps : [0],
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Navigation Functions
function setActiveLink() {
    const scrollPosition = window.scrollY;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize the app on page load
document.addEventListener('DOMContentLoaded', init); 