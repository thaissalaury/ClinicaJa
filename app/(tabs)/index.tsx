import React, { useState } from "react";
import { View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [senhaError, setSenhaError] = useState("");

  function fazerLogin() {
    let erro = false;

    setEmailError("");
    setSenhaError("");

    if (!email.includes("@")) {
      setEmailError("E-mail inválido");
      erro = true;
    }

    if (senha.length < 8) {
      setSenhaError("A senha deve ter pelo menos 8 caractéres.");
      erro = true;
    }

    if (erro) return;

    if (email.includes("medico")) {
      router.push("/medico");
    } else {
      router.push("/cliente");
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F4F8FB" }]}>

      <Ionicons name="medical" size={70} color={isDark ? "#60A5FA" : "#007AFF"} />

      <Text style={[styles.titulo, { color: isDark ? "#60A5FA" : "#007AFF" }]}>
        ClínicaJá
      </Text>

      <Text style={[styles.subtitulo, { color: isDark ? "#CBD5E1" : "#666" }]}>
        Bem-vindo! Faça login para continuar.
      </Text>

      {/* EMAIL */}
      <View style={[styles.inputContainer, {
        backgroundColor: isDark ? "#1E293B" : "#FFF",
        borderColor: isDark ? "#334155" : "#DDD"
      }]}>
        <Ionicons name="mail-outline" size={22} color="#777" style={styles.icon} />

        <TextInput
          style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
          placeholder="E-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
        />
      </View>

      {emailError ? (
        <Text style={styles.errorText}>{emailError}</Text>
      ) : null}

      {/* SENHA */}
      <View style={[styles.inputContainer, {
        backgroundColor: isDark ? "#1E293B" : "#FFF",
        borderColor: isDark ? "#334155" : "#DDD"
      }]}>
        <Ionicons name="lock-closed-outline" size={22} color="#777" style={styles.icon} />

        <TextInput
          style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={(text) => {
            setSenha(text);
            setSenhaError("");
          }}
        />

        <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
          <Ionicons
            name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#777"
          />
        </TouchableOpacity>
      </View>

      {senhaError ? (
        <Text style={styles.errorText}>{senhaError}</Text>
      ) : null}

      {/* BOTÃO */}
      <TouchableOpacity style={styles.botao} onPress={fazerLogin}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={[styles.link, { color: isDark ? "#60A5FA" : "#007AFF" }]}>
          Esqueci minha senha?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={[styles.link, { color: isDark ? "#60A5FA" : "#007AFF" }]}>
          Não possui conta? Cadastre-se
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* 🎨 STYLE BASE */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  titulo: {
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },

  subtitulo: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 35,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "75%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  icon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },

  botao: {
    width: "65%",
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  textoBotao: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  link: {
    fontSize: 15,
    marginTop: 18,
    textAlign: "center",
  },

  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "12%",
  },
});