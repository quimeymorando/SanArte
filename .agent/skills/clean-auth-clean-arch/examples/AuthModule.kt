package com.example.auth.di

import com.example.auth.data.remote.SupabaseClient
import com.example.auth.data.repository.AuthRepositoryImpl
import com.example.auth.domain.repository.AuthRepository
import com.example.auth.domain.use_case.LoginUseCase
import com.example.auth.presentation.login.LoginViewModel
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val authModule = module {
    // Data Sources & Clients
    single { SupabaseClient.create() }
    
    // Repositories (Interface to Implementation mapping)
    single<AuthRepository> { AuthRepositoryImpl(get(), get()) }
    
    // Use Cases (Individual Responsibility)
    factory { LoginUseCase(get()) }
    
    // ViewModels
    viewModel { LoginViewModel(get()) }
}
