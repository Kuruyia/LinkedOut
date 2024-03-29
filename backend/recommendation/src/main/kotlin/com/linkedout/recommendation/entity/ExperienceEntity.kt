package com.linkedout.recommendation.entity

import org.springframework.data.neo4j.core.schema.Id
import org.springframework.data.neo4j.core.schema.Node
import java.util.*

@Node("Experience")
data class ExperienceEntity(
    @Id
    val id: UUID
)
