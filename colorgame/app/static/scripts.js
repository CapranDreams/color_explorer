let currentColor = null;

// Update COLOR_RANGES to match all categories
const COLOR_RANGES = {
    random: {
        name: 'Random',
        check: () => true,
        title: 'Random Colors'
    },
    dark: {
        name: 'Dark',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 0.3 <= hsv.s && hsv.s <= 0.8 && hsv.v <= 0.3;
        },
        title: 'Dark Color Preferences'
    },
    light: {
        name: 'Light',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return hsv.s <= 0.3 && hsv.v >= 0.8;
        },
        title: 'Light Color Preferences'
    },
    earth: {
        name: 'Earth',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return (
                ((0 <= hsv.h && hsv.h <= 45) && 0.2 <= hsv.s && hsv.s <= 0.6 && 0.2 <= hsv.v && hsv.v <= 0.7) ||
                ((70 <= hsv.h && hsv.h <= 150) && 0.2 <= hsv.s && hsv.s <= 0.5 && 0.2 <= hsv.v && hsv.v <= 0.5) ||
                ((345 <= hsv.h && hsv.h <= 360) && 0.2 <= hsv.s && hsv.s <= 0.5 && 0.2 <= hsv.v && hsv.v <= 0.6)
            );
        },
        title: 'Earth Tone Preferences'
    },
    red: {
        name: 'Red',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return (hsv.h >= 345 || hsv.h <= 15) && hsv.s >= 0.7 && hsv.v >= 0.5;
        },
        title: 'Red Color Preferences'
    },
    orange: {
        name: 'Orange',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 15 < hsv.h && hsv.h <= 45 && hsv.s >= 0.7 && hsv.v >= 0.5;
        },
        title: 'Orange Color Preferences'
    },
    yellow: {
        name: 'Yellow',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 45 < hsv.h && hsv.h <= 75 && hsv.s >= 0.5 && hsv.v >= 0.8;
        },
        title: 'Yellow Color Preferences'
    },
    green: {
        name: 'Green',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 75 < hsv.h && hsv.h <= 165 && hsv.s >= 0.5 && hsv.v >= 0.4;
        },
        title: 'Green Color Preferences'
    },
    cyan: {
        name: 'Cyan',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 165 < hsv.h && hsv.h <= 195 && hsv.s >= 0.6 && hsv.v >= 0.6;
        },
        title: 'Cyan Color Preferences'
    },
    blue: {
        name: 'Blue',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 195 < hsv.h && hsv.h <= 255 && hsv.s >= 0.6 && hsv.v >= 0.5;
        },
        title: 'Blue Color Preferences'
    },
    purple: {
        name: 'Purple',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 255 < hsv.h && hsv.h <= 285 && hsv.s >= 0.4 && hsv.v >= 0.4;
        },
        title: 'Purple Color Preferences'
    },
    pink: {
        name: 'Pink',
        check: (rgb) => {
            const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
            return 285 < hsv.h && hsv.h <= 345 && hsv.s >= 0.3 && hsv.v >= 0.8;
        },
        title: 'Pink Color Preferences'
    }
};

// Add this near the top with other constants
const COLOR_CATEGORIES = {
    random: {
        name: 'Random',
        check: () => true
    },
    red: {
        name: 'Red',
        check: (rgb) => rgb.r > 0.6 && rgb.g < 0.4 && rgb.b < 0.4
    },
    orange: {
        name: 'Orange',
        check: (rgb) => rgb.r > 0.6 && rgb.g > 0.3 && rgb.g < 0.7 && rgb.b < 0.3
    },
    yellow: {
        name: 'Yellow',
        check: (rgb) => rgb.r > 0.7 && rgb.g > 0.7 && rgb.b < 0.3
    },
    green: {
        name: 'Green',
        check: (rgb) => rgb.g > 0.6 && rgb.r < 0.5 && rgb.b < 0.5
    },
    cyan: {
        name: 'Cyan',
        check: (rgb) => rgb.g > 0.5 && rgb.b > 0.5 && rgb.r < 0.3
    },
    blue: {
        name: 'Blue',
        check: (rgb) => rgb.b > 0.6 && rgb.r < 0.4 && rgb.g < 0.4
    },
    purple: {
        name: 'Purple',
        check: (rgb) => rgb.r > 0.4 && rgb.b > 0.6 && rgb.g < 0.3
    },
    pink: {
        name: 'Pink',
        check: (rgb) => rgb.r > 0.7 && rgb.b > 0.4 && rgb.g < 0.4
    },
    brown: {
        name: 'Brown',
        check: (rgb) => rgb.r > 0.4 && rgb.r < 0.7 && 
                        rgb.g > 0.2 && rgb.g < 0.5 && 
                        rgb.b < 0.3
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

    const response = await fetch('/colorgame/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
    });

    if (response.ok) {
        const data = await response.json();
        window.location.href = `/colorgame/color_rank?user=${encodeURIComponent(data.username)}`;
    } else {
        console.error('Login failed:', await response.text());
    }
}

async function getNewColor() {
    const currentUser = getCurrentUser();
    const colorMode = document.getElementById('colorModeSelect').value;
    
    try {
        const response = await fetch(`/colorgame/get_color/${currentUser}?mode=${colorMode}`);
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
        const response = await fetch('/colorgame/rank_color', {
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
        const response = await fetch(`/colorgame/analytics/${currentUser}`);
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
    window.location.href = '/colorgame/';
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
        window.location.href = `/colorgame/analytics?user=${encodeURIComponent(currentUser)}`;
    }
}

function goToColorRank() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = `/colorgame/color_rank?user=${encodeURIComponent(currentUser)}`;
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
        const response = await fetch(`/colorgame/analytics/${currentUser}`);
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

        // Plot visualizations
        await Promise.all([
            Plotly.newPlot('heatmap', [trace2d], layout2d, config),
            Plotly.newPlot('scatter3d', [trace3d], layout3d, config)
        ]);

        // Add HSV plots
        createHSVPlots(validColors, validRatings);

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

// Add this function to check if a color belongs to a category
function colorMatchesCategory(hex, category) {
    const rgb = hex_to_rgb(hex);
    if (!rgb) return false;
    
    const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
    const h = hsv.h;
    const s = hsv.s;
    const v = hsv.v;

    switch(category) {
        case 'random':
            return true;
        case 'dark':
            return s >= 0.3 && s <= 0.8 && v <= 0.3;
        case 'light':
            return s <= 0.3 && v >= 0.8;
        case 'red':
            return ((h >= 345 || h <= 15) && s >= 0.7 && v >= 0.5);
        case 'orange':
            return (h > 15 && h <= 45 && s >= 0.7 && v >= 0.5);
        case 'yellow':
            return (h > 45 && h <= 75 && s >= 0.5 && v >= 0.8);
        case 'green':
            return (h > 75 && h <= 165 && s >= 0.5 && v >= 0.4);
        case 'cyan':
            return (h > 165 && h <= 195 && s >= 0.6 && v >= 0.6);
        case 'blue':
            return (h > 195 && h <= 255 && s >= 0.6 && v >= 0.5);
        case 'purple':
            return (h > 255 && h <= 285 && s >= 0.4 && v >= 0.4);
        case 'pink':
            return (h > 285 && h <= 345 && s >= 0.3 && v >= 0.8);
        case 'earth':
            return (
                ((h >= 0 && h <= 45) && s >= 0.2 && s <= 0.6 && v >= 0.2 && v <= 0.7) ||
                ((h >= 70 && h <= 150) && s >= 0.2 && s <= 0.5 && v >= 0.2 && v <= 0.5) ||
                ((h >= 345 && h <= 360) && s >= 0.2 && s <= 0.5 && v >= 0.2 && v <= 0.6)
            );
        default:
            return false;
    }
}

function createHSVPlots(colors, ratings) {
    // Convert all colors to HSV
    const hsvColors = colors.map(color => ({
        hsv: hex_to_hsv(color),
        hex: color,
        rating: ratings[colors.indexOf(color)]
    }));

    // Create Hue plot
    const hueTrace = {
        type: 'scatter',
        mode: 'markers',
        x: hsvColors.map(c => c.hsv.h),
        y: hsvColors.map(c => c.rating),
        marker: {
            size: 10,
            color: hsvColors.map(c => c.hex)
        },
        hovertemplate: 
            'Color: <b>%{customdata}</b><br>' +
            'Hue: %{x:.1f}°<br>' +
            'Rating: %{y}<br>' +
            '<extra></extra>',
        customdata: hsvColors.map(c => c.hex)
    };

    const hueLayout = {
        title: 'Color Ratings by Hue',
        xaxis: {
            title: 'Hue (degrees)',
            range: [0, 360],
            tickmode: 'array',
            ticktext: ['0°', '60°', '120°', '180°', '240°', '300°', '360°'],
            tickvals: [0, 60, 120, 180, 240, 300, 360],
            gridcolor: '#444'
        },
        yaxis: {
            title: 'Rating',
            range: [0, 10],
            gridcolor: '#444'
        },
        plot_bgcolor: 'rgba(40, 40, 40, 0.95)',
        paper_bgcolor: 'rgba(40, 40, 40, 0.95)',
        font: { color: '#fff' },
        shapes: [{
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: 0,
            x1: 360,
            y0: 0,
            y1: 0.1,
            fillcolor: 'white',
            layer: 'below',
            line: { width: 0 }
        }]
    };

    // Create gradient for hue axis
    for (let h = 0; h < 360; h += 2) {
        hueLayout.shapes.push({
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: h,
            x1: h + 2,
            y0: 0,
            y1: 0.1,
            fillcolor: hsv_to_hex(h, 1, 1),
            layer: 'below',
            line: { width: 0 }
        });
    }

    // Create Saturation plot
    const satTrace = {
        type: 'scatter',
        mode: 'markers',
        x: hsvColors.map(c => c.hsv.s),
        y: hsvColors.map(c => c.rating),
        marker: {
            size: 10,
            color: hsvColors.map(c => c.hex)
        },
        hovertemplate: 
            'Color: <b>%{customdata}</b><br>' +
            'Saturation: %{x:.2f}<br>' +
            'Rating: %{y}<br>' +
            '<extra></extra>',
        customdata: hsvColors.map(c => c.hex)
    };

    const satLayout = {
        title: 'Color Ratings by Saturation',
        xaxis: {
            title: 'Saturation',
            range: [0, 1],
            gridcolor: '#444'
        },
        yaxis: {
            title: 'Rating',
            range: [0, 10],
            gridcolor: '#444'
        },
        plot_bgcolor: 'rgba(40, 40, 40, 0.95)',
        paper_bgcolor: 'rgba(40, 40, 40, 0.95)',
        font: { color: '#fff' },
        shapes: []
    };

    // Create gradient for saturation axis
    for (let s = 0; s < 1; s += 0.02) {
        satLayout.shapes.push({
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: s,
            x1: s + 0.02,
            y0: 0,
            y1: 0.1,
            fillcolor: hsv_to_hex(0, s, 1),
            layer: 'below',
            line: { width: 0 }
        });
    }

    // Create Value plot
    const valTrace = {
        type: 'scatter',
        mode: 'markers',
        x: hsvColors.map(c => c.hsv.v),
        y: hsvColors.map(c => c.rating),
        marker: {
            size: 10,
            color: hsvColors.map(c => c.hex)
        },
        hovertemplate: 
            'Color: <b>%{customdata}</b><br>' +
            'Value: %{x:.2f}<br>' +
            'Rating: %{y}<br>' +
            '<extra></extra>',
        customdata: hsvColors.map(c => c.hex)
    };

    const valLayout = {
        title: 'Color Ratings by Value',
        xaxis: {
            title: 'Value',
            range: [0, 1],
            gridcolor: '#444'
        },
        yaxis: {
            title: 'Rating',
            range: [0, 10],
            gridcolor: '#444'
        },
        plot_bgcolor: 'rgba(40, 40, 40, 0.95)',
        paper_bgcolor: 'rgba(40, 40, 40, 0.95)',
        font: { color: '#fff' },
        shapes: []
    };

    // Create gradient for value axis
    for (let v = 0; v < 1; v += 0.02) {
        valLayout.shapes.push({
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: v,
            x1: v + 0.02,
            y0: 0,
            y1: 0.1,
            fillcolor: hsv_to_hex(0, 0, v),
            layer: 'below',
            line: { width: 0 }
        });
    }

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('huePlot', [hueTrace], hueLayout, config);
    Plotly.newPlot('saturationPlot', [satTrace], satLayout, config);
    Plotly.newPlot('valuePlot', [valTrace], valLayout, config);
}

function hex_to_hsv(hex) {
    const rgb = hex_to_rgb(hex);
    const r = rgb.r;
    const g = rgb.g;
    const b = rgb.b;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff === 0) h = 0;
    else if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
    
    h = h * 60;
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return { h, s, v };
}

function hsv_to_hex(h, s, v) {
    const hi = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r, g, b;
    
    switch (hi) {
        case 0: [r, g, b] = [v, t, p]; break;
        case 1: [r, g, b] = [q, v, p]; break;
        case 2: [r, g, b] = [p, v, t]; break;
        case 3: [r, g, b] = [p, q, v]; break;
        case 4: [r, g, b] = [t, p, v]; break;
        default: [r, g, b] = [v, p, q];
    }
    
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgb_to_hsv(r, g, b) {
    // Normalize RGB values to 0-1 range
    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff === 0) {
        h = 0;
    } else if (max === r) {
        h = ((g - b) / diff) % 6;
    } else if (max === g) {
        h = (b - r) / diff + 2;
    } else {
        h = (r - g) / diff + 4;
    }
    
    h = h * 60;
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return { h, s, v };
}

function updateColorRangePlot() {
    const selectedRange = document.getElementById('colorRangeSelect').value;
    const rangeConfig = COLOR_RANGES[selectedRange];
    
    const filteredColors = globalValidColors.filter(color => {
        const rgb = hex_to_rgb(color);
        return rgb && rangeConfig.check(rgb);
    });
    
    const colorRatings = filteredColors.map(color => {
        const rgb = hex_to_rgb(color);
        const hsv = rgb_to_hsv(rgb.r * 255, rgb.g * 255, rgb.b * 255);
        return {
            color: color,
            rating: globalValidRatings[globalValidColors.indexOf(color)],
            value: selectedRange === 'random' ? 1 : hsv.v
        };
    });

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
            'Value: %{text:.2f}<br>' +
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