import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type Perfil = "medico" | "paciente";

const perfis = [
  {
    id: "medico",
    titulo: "Médico",
    descricao: "Agenda, pacientes e atendimentos",
    icon: "medical-outline",
  },
  {
    id: "paciente",
    titulo: "Paciente",
    descricao: "Consultas, histórico e agendamentos",
    icon: "person-outline",
  },
] as const;

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState<Perfil>("paciente");

  const [emailError, setEmailError] = useState("");
  const [senhaError, setSenhaError] = useState("");

  async function fazerLogin() {
    let erro = false;

    setEmailError("");
    setSenhaError("");

    console.log('[LoginScreen] fazerLogin iniciado. Email:', email.trim(), '| Perfil selecionado:', perfilSelecionado);

    if (!email.trim().includes("@")) {
      setEmailError("E-mail inválido");
      console.log('[LoginScreen] Validação de e-mail falhou.');
      erro = true;
    }

    if (!senha.trim()) {
      setSenhaError("Digite uma senha para continuar.");
      console.log('[LoginScreen] Validação de senha falhou: campo vazio.');
      erro = true;
    }

    if (erro) {
      console.log('[LoginScreen] fazerLogin interrompido devido a erros de validação local.');
      return;
    }

    try {
      console.log('[LoginScreen] Importando apiRequest e saveAccessToken dinamicamente...');
      const { apiRequest } = await import('@/services/api');
      const { saveAccessToken } = await import('@/utils/authToken');
      console.log('[LoginScreen] Módulos importados com sucesso.');

      console.log('[LoginScreen] Disparando chamada apiRequest para /auth/login...');
      const result = await apiRequest('/auth/login', 'POST', {
        email: email.trim(),
        password: senha,
      });
      console.log('[LoginScreen] apiRequest retornado. Sucesso (result.ok):', result.ok);

      if (!result.ok) {
        console.warn('[LoginScreen] Falha de login retornada da API:', result.error);
        setSenhaError(result.error || 'Erro ao fazer login');
        return;
      }

      const token = result.data?.session?.access_token;
      console.log('[LoginScreen] Token extraído da resposta:', token ? 'PRESENTE' : 'AUSENTE/NULO');
      
      if (!token) {
        console.error('[LoginScreen] Erro: Token de acesso ausente no payload da sessão.');
        setSenhaError('Sessão não retornada pelo servidor. Tente novamente.');
        return;
      }

      console.log('[LoginScreen] Gravando token de acesso no AsyncStorage...');
      await saveAccessToken(token);
      console.log('[LoginScreen] Gravação de token finalizada. Redirecionando...');

      const targetPath = perfilSelecionado === "medico" ? "/medico" : "/cliente";
      console.log('[LoginScreen] Rota de destino calculada:', targetPath);

      router.push(targetPath as any);
      console.log('[LoginScreen] router.push executado com sucesso para a rota interna.');
    } catch (e: any) {
      console.error('[LoginScreen] Exceção crítica capturada em fazerLogin:', e);
      setSenhaError(e?.message || 'Erro ao fazer login');
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#0F172A" : "#F4F8FB" },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name="medical"
            size={70}
            color={isDark ? "#60A5FA" : "#007AFF"}
          />

          <Text style={[styles.titulo, { color: isDark ? "#60A5FA" : "#007AFF" }]}>
            ClínicaJá
          </Text>

          <Text style={[styles.subtitulo, { color: isDark ? "#CBD5E1" : "#666" }]}>
            Bem-vindo! Faça login para continuar.
          </Text>
        </View>

        <View style={styles.perfilGroup}>
          <Text style={[styles.label, { color: isDark ? "#E2E8F0" : "#111" }]}>
            Entrar como
          </Text>

          <View style={styles.perfilList}>
            {perfis.map((perfil) => {
              const selecionado = perfilSelecionado === perfil.id;

              return (
                <TouchableOpacity
                  key={perfil.id}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selecionado }}
                  accessibilityLabel={`Selecionar perfil ${perfil.titulo}`}
                  style={[
                    styles.perfilCard,
                    {
                      backgroundColor: selecionado
                        ? isDark
                          ? "#0B3B75"
                          : "#E8F2FF"
                        : isDark
                          ? "#1E293B"
                          : "#FFF",
                      borderColor: selecionado
                        ? "#007AFF"
                        : isDark
                          ? "#334155"
                          : "#DDD",
                    },
                  ]}
                  onPress={() => setPerfilSelecionado(perfil.id)}
                >
                  <Ionicons
                    name={perfil.icon}
                    size={24}
                    color={selecionado ? "#007AFF" : isDark ? "#CBD5E1" : "#777"}
                  />

                  <View style={styles.perfilTexto}>
                    <Text
                      style={[
                        styles.perfilTitulo,
                        { color: isDark ? "#fff" : "#111" },
                      ]}
                    >
                      {perfil.titulo}
                    </Text>
                    <Text style={{ color: isDark ? "#CBD5E1" : "#666" }}>
                      {perfil.descricao}
                    </Text>
                  </View>

                  {selecionado ? (
                    <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFF",
              borderColor: isDark ? "#334155" : "#DDD",
            },
          ]}
        >
          <Ionicons name="mail-outline" size={22} color="#777" style={styles.icon} />

          <TextInput
            style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
            placeholder="E-mail"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
            }}
          />
        </View>

        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFF",
              borderColor: isDark ? "#334155" : "#DDD",
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#777"
            style={styles.icon}
          />

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

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            onPress={() => setMostrarSenha(!mostrarSenha)}
          >
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Entrar como ${
            perfilSelecionado === "medico" ? "Médico" : "Paciente"
          }`}
          style={styles.botao}
          onPress={fazerLogin}
        >
          <Ionicons name="log-in-outline" size={22} color="#fff" />
          <Text style={styles.textoBotao}>
            Entrar como {perfilSelecionado === "medico" ? "Médico" : "Paciente"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button">
          <Text style={[styles.link, { color: isDark ? "#60A5FA" : "#007AFF" }]}>
            Esqueci minha senha?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cadastre-se"
          onPress={() =>
            router.push(perfilSelecionado === "medico" ? "/cadastro-medico" : "/cadastro-paciente")
          }
        >
          <Text style={[styles.link, { color: isDark ? "#60A5FA" : "#007AFF" }]}> 
            Não possui conta? Cadastre-se
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
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
  },

  perfilGroup: {
    width: "100%",
    marginBottom: 14,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  perfilList: {
    gap: 10,
  },

  perfilCard: {
    width: "100%",
    minHeight: 74,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
  },

  perfilTexto: {
    flex: 1,
  },

  perfilTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 2,
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
    width: "100%",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },

  textoBotao: {
    color: "#FFF",
    fontSize: 17,
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
  },
});
