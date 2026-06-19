package com.cinesync.app.domain.models

data class Media(
    val id: String,
    val title: String,
    val posterUrl: String? = null,
    val overview: String? = null,
    val backdropUrl: String? = null
)
