package com.example.auth.domain.use_case

import com.example.auth.domain.repository.AuthRepository
import com.example.auth.domain.model.AuthResult

class LoginUseCase(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): AuthResult {
        if(email.isBlank() || password.isBlank()) {
            return AuthResult.Error("El email y la contraseña son obligatorios")
        }
        return repository.login(email, password)
    }
}
