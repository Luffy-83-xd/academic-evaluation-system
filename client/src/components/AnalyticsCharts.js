import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components needed for the charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsCharts = ({ data }) => {
    // Prepare data for the Quiz Scores Bar Chart
    const quizData = data.filter(item => item.type === 'Quiz');
    const quizScores = quizData.map(item => {
        const [score, maxScore] = item.grade.split(' / ').map(Number);
        return (score / maxScore) * 100; // Calculate percentage
    });
    const quizLabels = quizData.map(item => item.title);

    const barChartData = {
        labels: quizLabels,
        datasets: [{
            label: 'Quiz Score (%)',
            data: quizScores,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    // Prepare data for the Overall Performance Line Chart
    const gradeToValue = (grade) => {
        if (typeof grade === 'string') {
            if (grade.includes('/')) {
                const [score, max] = grade.split(' / ').map(Number);
                return (score / max) * 100;
            }
            const upperGrade = grade.toUpperCase();
            if (upperGrade.startsWith('A')) return 90;
            if (upperGrade.startsWith('B')) return 80;
            if (upperGrade.startsWith('C')) return 70;
            if (upperGrade.startsWith('D')) return 60;
        }
        return 0;
    };

    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const lineChartLabels = sortedData.map(item => `${item.title} (${new Date(item.date).toLocaleDateString()})`);
    const lineChartScores = sortedData.map(item => gradeToValue(item.grade));
    
    const lineChartData = {
        labels: lineChartLabels,
        datasets: [{
            label: 'Overall Performance Trend (%)',
            data: lineChartScores,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        }],
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Quiz Performance</h3>
                <Bar data={barChartData} options={{ responsive: true }} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Performance Trend</h3>
                <Line data={lineChartData} options={{ responsive: true }} />
            </div>
        </div>
    );
};

export default AnalyticsCharts;