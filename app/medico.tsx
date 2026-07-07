import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Medico() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F4F8FB" }]}>
      <Ionicons
        name="medical-outline"
        size={70}
        color={isDark ? "#60A5FA" : "#007AFF"}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]}>
        Área do Médico 🩺
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? "#CBD5E1" : "#666" }]}>
        Bem-vindo ao painel profissional
      </Text>

      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: isDark ? "#60A5FA" : "#007AFF" }]}
        onPress={() => router.push("/cadastro-medico")}
      >
        <Ionicons name="people-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}>Cadastrar Médico</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  mainButton: {
    flexDirection: "row",
    gap: 8,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});