import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

type WeatherMetricsGridProps = {
  humidity?: number;
  pressure?: number;
  visibility?: number;
  windSpeed?: number;
};

// Metric item component for consistent styling
const MetricCard = ({
  icon,
  name,
  value,
  unit,
}: {
  icon: React.ReactNode;
  name: string;
  value: any;
  unit: string;
}) => (
  <View style={styles.metricCard}>
    <View style={styles.iconContainer}>{icon}</View>
    <View style={styles.metricInfo}>
      <Text style={styles.metricName}>{name}</Text>
      <Text style={styles.metricValue}>
        {value ?? "N/A"}
        {unit}
      </Text>
    </View>
  </View>
);

const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  humidity,
  pressure,
  visibility,
  windSpeed,
}) => {
  return (
    <View style={styles.container}>


      <View style={styles.gridContainer}>
        {/* Humidity */}
        <MetricCard
          icon={<Ionicons name="water-outline" size={24} color="white" />}
          name="Humidity"
          value={humidity}
          unit="%"
        />

        {/* Pressure */}
        <MetricCard
          icon={<MaterialCommunityIcons name="gauge" size={24} color="white" />}
          name="Pressure"
          value={pressure}
          unit=" hPa"
        />

        {/* Visibility */}
        <MetricCard
          icon={<Feather name="eye" size={24} color="white" />}
          name="Visibility"
          value={visibility}
          unit=" km"
        />

        {/* Wind Speed */}
        <MetricCard
          icon={<Feather name="wind" size={24} color="white" />}
          name="Wind Speed"
          value={windSpeed}
          unit=" km/h"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    marginHorizontal: 20,
  },
  title: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    boxShadow: "1px 5px 10px 0 rgba(0, 0, 0, 0.2)",
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  metricValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default WeatherMetricsGrid;
