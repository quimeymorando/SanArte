package com.example.auth.data.repository

import com.example.auth.data.remote.AuthApi
import com.example.auth.data.local.TokenManager
import com.example.auth.data.mapper.toUser
import com.example.auth.domain.model.AuthResult
import com.example.auth.domain.repository.AuthRepository
import kotlinx.coroutines.flow.first

class AuthRepositoryImpl(
    private val api: AuthApi,
    private val tokenManager: TokenManager
): AuthRepository {

    override suspend fun login(email: String, password: String): AuthResult {
        return try {
            val response = api.login(email, password)
            if (response.isSuccessful && response.body() != null) {
                val dto = response.body()!!
                tokenManager.saveToken(dto.token)
                AuthResult.Success(dto.toUser())
            } else {
                AuthResult.Error("Error de autenticación: ${response.code()}")
            }
        } catch (e: Exception) {
            AuthResult.Error("Error de red: ${e.localizedMessage}")
        }
    }

    override suspend fun authenticate(): AuthResult {
        val token = tokenManager.getToken().first() ?: return AuthResult.Unauthorized
        return try {
            val response = api.authenticate("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                AuthResult.Success(response.body()!!.toUser())
            } else {
                AuthResult.Unauthorized
            }
        } catch (e: Exception) {
            AuthResult.Error("Fallo de conexión")
        }
    }

    override suspend fun logout() {
        tokenManager.deleteToken()
    }
}
