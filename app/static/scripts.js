let currentColor = null;

// Add this color range definition object
const COLOR_RANGES = {
    green: {
        name: 'Green',
        check: (rgb) => rgb.g > rgb.r && rgb.g > rgb.b && rgb.g > 0.4,
        title: 'Green Color Preferences'
    },
    blue: {
        name: 'Blue',
        check: (rgb) => rgb.b > rgb.r && rgb.b > rgb.g && rgb.b > 0.4,
        title: 'Blue Color Preferences'
    },
    purple: {
        name: 'Purple',
        check: (rgb) => rgb.r > 0.3 && rgb.b > 0.3 && rgb.g < Math.min(rgb.r, rgb.b),
        title: 'Purple Color Preferences'
    },
    yellow: {
        name: 'Yellow',
        check: (rgb) => rgb.r > 0.5 && rgb.g > 0.5 && rgb.b < Math.min(rgb.r, rgb.g),
        title: 'Yellow Color Preferences'
    },
    red: {
        name: 'Red',
        check: (rgb) => rgb.r > rgb.g && rgb.r > rgb.b && rgb.r > 0.4,
        title: 'Red Color Preferences'
    },
    orange: {
        name: 'Orange',
        check: (rgb) => rgb.r > 0.5 && rgb.g > 0.2 && rgb.b < 0.3 && rgb.r > rgb.g,
        title: 'Orange Color Preferences'
    },
    pink: {
        name: 'Pink',
        check: (rgb) => rgb.r > 0.6 && rgb.b > 0.4 && rgb.g < Math.min(rgb.r, rgb.b),
        title: 'Pink Color Preferences'
    },
    cyan: {
        name: 'Cyan',
        check: (rgb) => rgb.g > 0.4 && rgb.b > 0.4 && rgb.r < Math.min(rgb.g, rgb.b),
        title: 'Cyan Color Preferences'
    }
};

// Add these variables at the top level to store the data
let globalValidColors = [];
let globalValidRatings = [];

function getCurrentUser() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user');
}

async function login() {
    const username = document.getElementById('username').value;
    if (!username) return;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
    });

    if (response.ok) {
        const data = await response.json();
        window.location.href = `/color_rank?user=${encodeURIComponent(data.username)}`;
    } else {
        console.error('Login failed:', await response.text());
    }
}

async function getNewColor() {
    const currentUser = getCurrentUser();
    try {
        const response = await fetch(`/get_color/${currentUser}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('Failed to get new color:', errorData);
            return;
        }
        const data = await response.json();
        currentColor = data.color;
        document.getElementById('colorDisplay').style.backgroundColor = currentColor;
    } catch (error) {
        console.error('Error getting new color:', error);
    }
}

async function rateColor(rating) {
    const currentUser = getCurrentUser();
    if (!currentColor || !currentUser) return;

    try {
        const response = await fetch('/rank_color', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: currentUser,
                color: currentColor,
                rating: rating
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Rating failed:', errorData);
            return;
        }

        const data = await response.json();
        if (data.success) {
            await updateRankCount();  // Make sure we wait for the count to update
            getNewColor();
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
    }
}

async function updateRankCount() {
    const currentUser = getCurrentUser();
    try {
        const response = await fetch(`/analytics/${currentUser}`);
        if (!response.ok) {
            console.error('Failed to fetch rankings');
            return;
        }
        const data = await response.json();
        const count = Object.keys(data.rankings).length;
        document.getElementById('rankCount').textContent = count;
    } catch (error) {
        console.error('Error updating rank count:', error);
    }
}

function goHome() {
    window.location.href = '/';
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/^[1-9]$/.test(key)) {
        rateColor(parseInt(key));
    }
});

// Add this function
function updateUserDisplay() {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        const currentUser = getCurrentUser();
        userDisplay.textContent = currentUser || 'Not logged in';
    }
}

// Add these navigation functions
function goToAnalytics() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = `/analytics?user=${encodeURIComponent(currentUser)}`;
    }
}

function goToColorRank() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = `/color_rank?user=${encodeURIComponent(currentUser)}`;
    }
}

if (window.location.pathname.includes('analytics')) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/';
    } else {
        initializeHeatmap();
    }
} else if (window.location.pathname.includes('color_rank')) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/';
    } else {
        getNewColor();
        updateRankCount();
        updateUserDisplay();
    }
}

async function initializeHeatmap() {
    const currentUser = getCurrentUser();
    try {
        const response = await fetch(`/analytics/${currentUser}`);
        if (!response.ok) {
            throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        const colors = Object.keys(data.rankings);
        const ratings = Object.values(data.rankings);

        if (colors.length === 0) {
            document.getElementById('heatmap').innerHTML = 
                '<div class="no-data-message">No color ratings yet. Go rate some colors!</div>';
            document.getElementById('scatter3d').innerHTML = 
                '<div class="no-data-message">No color ratings yet. Go rate some colors!</div>';
            return;
        }

        // Process the color data
        const labColors = colors.map(c => hex_to_lab(c)).filter(lab => lab !== null);
        const validColors = colors.filter((_, i) => hex_to_lab(colors[i]) !== null);
        const validRatings = ratings.filter((_, i) => hex_to_lab(colors[i]) !== null);

        // Create the 2D visualization
        const trace2d = {
            type: 'scatter',
            mode: 'markers',
            x: labColors.map(lab => lab.a),
            y: labColors.map(lab => lab.b),
            marker: {
                size: 15,
                color: validColors,
                colorscale: false,
                showscale: false
            },
            hovertemplate: 
                'Color: <b>%{text}</b><br>' +
                'Rating: %{customdata}<br>' +
                '<extra></extra>',
            text: validColors,
            customdata: validRatings
        };

        const layout2d = {
            title: 'Color Preferences in CIELAB Space (2D)',
            xaxis: { 
                title: 'a* (Green → Red)',
                range: [-128, 127],
                zeroline: true,
                zerolinecolor: '#666',
                gridcolor: '#444',
                color: '#fff'
            },
            yaxis: { 
                title: 'b* (Blue → Yellow)',
                range: [-128, 127],
                zeroline: true,
                zerolinecolor: '#666',
                gridcolor: '#444',
                color: '#fff'
            },
            paper_bgcolor: 'rgba(40, 40, 40, 0.95)',
            plot_bgcolor: 'rgba(40, 40, 40, 0.95)',
            font: {
                color: '#fff'
            }
        };

        // Create the 3D visualization
        const trace3d = {
            type: 'scatter3d',
            mode: 'markers',
            x: labColors.map(lab => lab.a),
            y: labColors.map(lab => lab.b),
            z: validRatings,
            marker: {
                size: 8,
                color: validColors,
                colorscale: false,
                showscale: false
            },
            hovertemplate: 
                'Color: <b>%{text}</b><br>' +
                'a*: %{x:.1f}<br>' +
                'b*: %{y:.1f}<br>' +
                'Rating: %{z}<br>' +
                '<extra></extra>',
            text: validColors
        };

        const layout3d = {
            title: 'Color Preferences in CIELAB Space (3D)',
            scene: {
                xaxis: {
                    title: 'a* (Green → Red)',
                    range: [-128, 127],
                    gridcolor: '#444',
                    color: '#fff'
                },
                yaxis: {
                    title: 'b* (Blue → Yellow)',
                    range: [-128, 127],
                    gridcolor: '#444',
                    color: '#fff'
                },
                zaxis: {
                    title: 'Rating',
                    range: [1, 9],
                    gridcolor: '#444',
                    color: '#fff'
                },
                camera: {
                    eye: {x: 1.5, y: 1.5, z: 1.5}
                }
            },
            paper_bgcolor: 'rgba(40, 40, 40, 0.95)',
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 30,
                pad: 0
            }
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d']
        };

        // After processing color data
        globalValidColors = validColors;
        globalValidRatings = validRatings;

        // Instead of creating greenPlot directly, call updateColorRangePlot
        updateColorRangePlot();

        // Plot the first two visualizations
        await Promise.all([
            Plotly.newPlot('heatmap', [trace2d], layout2d, config),
            Plotly.newPlot('scatter3d', [trace3d], layout3d, config)
        ]);

    } catch (error) {
        console.error('Error initializing visualizations:', error);
        const errorDiv = document.getElementById('heatmapError');
        errorDiv.textContent = 'Failed to load analytics. Please try again later.';
        errorDiv.style.display = 'block';
    }
}

function hex_to_rgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

function rgb_to_xyz(rgb) {
    let r = rgb.r > 0.04045 ? Math.pow((rgb.r + 0.055) / 1.055, 2.4) : rgb.r / 12.92;
    let g = rgb.g > 0.04045 ? Math.pow((rgb.g + 0.055) / 1.055, 2.4) : rgb.g / 12.92;
    let b = rgb.b > 0.04045 ? Math.pow((rgb.b + 0.055) / 1.055, 2.4) : rgb.b / 12.92;

    r *= 100;
    g *= 100;
    b *= 100;

    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return { x, y, z };
}

function xyz_to_lab(xyz) {
    const ref = {
        x: 95.047,
        y: 100.000,
        z: 108.883
    };

    let x = xyz.x / ref.x;
    let y = xyz.y / ref.y;
    let z = xyz.z / ref.z;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    return {
        l: (116 * y) - 16,
        a: 500 * (x - y),
        b: 200 * (y - z)
    };
}

function hex_to_lab(hex) {
    const rgb = hex_to_rgb(hex);
    if (!rgb) return null;
    const xyz = rgb_to_xyz(rgb);
    return xyz_to_lab(xyz);
}

// Add this new function to update the color range plot
function updateColorRangePlot() {
    const selectedRange = document.getElementById('colorRangeSelect').value;
    const rangeConfig = COLOR_RANGES[selectedRange];
    
    const filteredColors = globalValidColors.filter(color => {
        const rgb = hex_to_rgb(color);
        return rgb && rangeConfig.check(rgb);
    });
    
    const colorRatings = filteredColors.map(color => ({
        color: color,
        rating: globalValidRatings[globalValidColors.indexOf(color)],
        value: hex_to_rgb(color)[selectedRange[0]] // First letter of color name
    }));

    // Sort by rating
    colorRatings.sort((a, b) => b.rating - a.rating);

    const trace = {
        type: 'scatter',
        mode: 'markers',
        x: colorRatings.map((_, i) => i),
        y: colorRatings.map(c => c.rating),
        marker: {
            size: 15,
            color: colorRatings.map(c => c.color),
            symbol: 'square',
        },
        hovertemplate: 
            'Color: <b>%{customdata}</b><br>' +
            'Rating: %{y}<br>' +
            `${rangeConfig.name}: %{text:.0%}<br>` +
            '<extra></extra>',
        text: colorRatings.map(c => c.value),
        customdata: colorRatings.map(c => c.color)
    };

    const layout = {
        title: `${rangeConfig.title} (Sorted by Rating)`,
        xaxis: { 
            title: 'Color Index (Sorted by Rating)',
            showticklabels: false,
            gridcolor: '#444',
            color: '#fff'
        },
        yaxis: { 
            title: 'Rating',
            range: [0, 10],
            gridcolor: '#444',
            color: '#fff'
        },
        paper_bgcolor: 'rgba(40, 40, 40, 0.95)',
        plot_bgcolor: 'rgba(40, 40, 40, 0.95)',
        font: {
            color: '#fff'
        },
        height: 300,
        margin: {
            l: 50,
            r: 20,
            t: 40,
            b: 40
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('colorRangePlot', [trace], layout, config);
} 