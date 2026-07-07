import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Cliente() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#0F172A" : "#F4F8FB" },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons
          name="person-circle-outline"
          size={70}
          color={isDark ? "#60A5FA" : "#007AFF"}
        />

        <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]}>
          Área do Cliente
        </Text>

        <Text style={{ color: isDark ? "#CBD5E1" : "#666" }}>
          Bem-vindo ao ClínicaJá 👤
        </Text>
      </View>

      {/* CARD PRÓXIMA CONSULTA */}
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#1E293B" : "#fff" },
        ]}
      >
        <Ionicons name="calendar-outline" size={28} color="#007AFF" />

        <Text
          style={[
            styles.cardTitle,
            { color: isDark ? "#fff" : "#111" },
          ]}
        >
          Próxima consulta
        </Text>

        <Text style={{ color: isDark ? "#CBD5E1" : "#666" }}>
          Nenhuma consulta marcada
        </Text>
      </View>

      {/* CARD HISTÓRICO */}
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#1E293B" : "#fff" },
        ]}
      >
        <Ionicons name="time-outline" size={28} color="#F59E0B" />

        <Text
          style={[
            styles.cardTitle,
            { color: isDark ? "#fff" : "#111" },
          ]}
        >
          Histórico
        </Text>

        <Text style={{ color: isDark ? "#CBD5E1" : "#666" }}>
          Nenhuma consulta anterior
        </Text>
      </View>

      {/* 🚀 BOTÃO PRINCIPAL (ÚNICO) */}
      <TouchableOpacity style={styles.mainButton}>
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}>Agendar consulta</Text>
      </TouchableOpacity>

      {/* Botão de Cadastro de Paciente */}
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: isDark ? "#60A5FA" : "#007AFF", marginTop: 12 }]}
        onPress={() => router.push("/cadastro-paciente")}
      >
        <Ionicons name="person-add-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}>Cadastrar Paciente</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* 🎨 STYLE */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },

  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  /* 🔵 BOTÃO PRINCIPAL */
  mainButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});