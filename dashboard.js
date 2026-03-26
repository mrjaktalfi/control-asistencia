
class Dashboard {
    constructor() {
        this.initialized = false;
        this.chart = null;
    }
    
    init() {
        if (this.initialized) {
            this.refreshCharts(); // Resize charts if already init
            return;
        }
        this.initialized = true;
        this.initCharts();
        this.updateStats();
    }
    
    initCharts() {
        const chartDom = document.getElementById('activity-chart');
        if (chartDom) {
            this.chart = echarts.init(chartDom);
            const option = {
                xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                yAxis: { type: 'value' },
                series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: 'bar' }]
            };
            this.chart.setOption(option);
        }
    }
    
    refreshCharts() {
        if (this.chart) this.chart.resize();
    }
    
    updateStats() {
        // Mock update
        document.getElementById('dash-total-employees').textContent = '12';
        document.getElementById('dash-active-locations').textContent = '3';
        document.getElementById('dash-today-checkins').textContent = '8';
    }
    
    refreshAll() {
        this.updateStats();
        alert('Datos refrescados');
    }
}
window.dashboard = new Dashboard();
